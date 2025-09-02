import time, math, smbus2, ms5837, json
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont

LOG_FILE = "mesures.json"

def log_measurement(temp, press, depth, azimuth):
    """Stocke une mesure dans un fichier JSON avec un horodatage"""
    data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",  # temps UTC format ISO 8601
        "temperature_c": temp,
        "pression_mbar": press,
        "profondeur_m": depth,
        "azimut_deg": azimuth
    }

    # lire l’ancien contenu
    try:
        with open(LOG_FILE, "r") as f:
            mesures = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        mesures = []

    # ajouter la nouvelle mesure
    mesures.append(data)

    # sauvegarder
    with open(LOG_FILE, "w") as f:
        json.dump(mesures, f, indent=2)

# --- MS5837 (pression + température) ---
sensor = ms5837.MS5837_30BA()
if not sensor.init():
    print("Erreur : MS5837 non détecté")
    exit(1)

# --- QMC5883L (boussole) ---
QMC5883L_ADDR = 0x0D
bus = smbus2.SMBus(1)
bus.write_byte_data(QMC5883L_ADDR, 0x09, 0b00011101)  # config

def read_raw_qmc5883l():
    data = bus.read_i2c_block_data(QMC5883L_ADDR, 0x00, 6)
    x = data[0] | (data[1] << 8)
    y = data[2] | (data[3] << 8)
    z = data[4] | (data[5] << 8)
    if x >= 32768: x -= 65536
    if y >= 32768: y -= 65536
    if z >= 32768: z -= 65536
    return x, y, z

# --- Calibration simple ---
def calibrate_qmc5883l(duration=10):
    xmin = ymin = 99999
    xmax = ymax = -99999
    start = time.time()
    while time.time() - start < duration:
        x, y, z = read_raw_qmc5883l()
        xmin, xmax = min(xmin, x), max(xmax, x)
        ymin, ymax = min(ymin, y), max(ymax, y)
        time.sleep(0.05)
    return (xmax + xmin) / 2, (ymax + ymin) / 2

def image_to_rgb565(img):
    """Convertit une image PIL RGB en bytes RGB565"""
    arr = bytearray()
    for r, g, b in img.getdata():
        rgb = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
        arr.append((rgb >> 8) & 0xFF)
        arr.append(rgb & 0xFF)
    return bytes(arr)

print("Calibration boussole : tourne le capteur 10s...")
x_offset, y_offset = calibrate_qmc5883l()
print("Calibration terminée.")

def read_heading():
    x, y, z = read_raw_qmc5883l()
    x -= x_offset
    y -= y_offset
    heading = math.degrees(math.atan2(y, x))
    if heading < 0:
        heading += 360
    return heading

# --- Framebuffer ---
FBDEV = "/dev/fb1"   # ou /dev/fb0 selon ton setup
WIDTH, HEIGHT = 480, 320

# Police (si pas dispo, utiliser ImageFont.load_default())
try:
    font_big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
except:
    font_big = ImageFont.load_default()
    font_small = ImageFont.load_default()

fb = open(FBDEV, "wb")

while True:
    # lire capteurs
    if sensor.read():
        temp = sensor.temperature()
        press = sensor.pressure()
        depth = sensor.depth()
    else:
        temp, press, depth = 0, 0, 0

    heading = read_heading()

    # créer image
    img = Image.new("RGB", (WIDTH, HEIGHT), "black")
    draw = ImageDraw.Draw(img)

    # affichage texte
    draw.text((20, 20), f"Temp: {temp:.2f} °C", font=font_big, fill="white")
    draw.text((20, 80), f"Press: {press:.2f} mbar", font=font_big, fill="white")
    draw.text((20, 140), f"Depth: {depth:.2f} m", font=font_big, fill="white")

    # boussole
    cx, cy = 350, 200
    r = 80
    draw.ellipse((cx-r, cy-r, cx+r, cy+r), outline="white", width=3)
    angle = math.radians(heading)
    x2 = cx + r * math.sin(angle)
    y2 = cy - r * math.cos(angle)
    draw.line((cx, cy, x2, y2), fill="red", width=4)
    draw.text((cx-20, cy+r+10), f"{heading:.1f}°", font=font_small, fill="white")

    # envoyer vers framebuffer
    fb.seek(0)
    fb.write(image_to_rgb565(img))

    # log les données dans un fichier JSON
    log_measurement(temp, press, depth, heading)

    time.sleep(0.2)
