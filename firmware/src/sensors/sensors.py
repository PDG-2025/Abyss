import time, math, smbus2, ms5837, json, threading
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont


LOG_FILE = "mesures.json"
QMC5883L_BUS = 1
QMC5883L_ADDR = 0x0D
QMC5883L_REGISTER = 0x09
QMC5883L_VALUE = 0b00011101


def init_ms5837():
    # --- MS5837 (pression + température) ---
    sensor = ms5837.MS5837_30BA()
    if not sensor.init():
        print("Erreur : MS5837 non détecté")
        exit(1)
    return sensor

def init_qmc5883l():
    # --- QMC5883L (boussole) ---
    bus = smbus2.SMBus(QMC5883L_BUS)
    bus.write_byte_data(QMC5883L_ADDR, QMC5883L_REGISTER, QMC5883L_VALUE)  # config
    return bus


class SensorsManager:
    def __init__(self):
        self.ms5837 = init_ms5837()
        self.qmc5883l = init_qmc5883l()
        self.x_offset = None
        self.y_offset = None
        self.stop_thread = True
        self.thread = threading.Thread(target=self.job)


    def read_raw_qmc5883l(self):
        data = self.qmc5883l.read_i2c_block_data(QMC5883L_ADDR, 0x00, 6)
        x = data[0] | (data[1] << 8)
        y = data[2] | (data[3] << 8)
        z = data[4] | (data[5] << 8)
        if x >= 32768: x -= 65536
        if y >= 32768: y -= 65536
        if z >= 32768: z -= 65536
        return x, y, z


    # --- Calibration simple ---
    def calibrate_qmc5883l(self, duration=10):
        print("Calibration boussole : tourne le capteur 10s...")
        xmin = ymin = 99999
        xmax = ymax = -99999
        start = time.time()
        while time.time() - start < duration:
            x, y, z = self.read_raw_qmc5883l()
            xmin, xmax = min(xmin, x), max(xmax, x)
            ymin, ymax = min(ymin, y), max(ymax, y)
            time.sleep(0.05)
        self.x_offset = (xmax + xmin) / 2
        self.y_offset = (ymax + ymin) / 2
        print("Calibration terminée.")

    def is_calibrated(self):
        return self.x_offset is not None and self.y_offset is not None

    def log_measurement(self, temp, press, depth, azimuth):
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

        return True

    def read_heading(self):
        x, y, z = self.read_raw_qmc5883l()
        x -= self.x_offset
        y -= self.y_offset
        heading = math.degrees(math.atan2(y, x))
        if heading < 0:
            heading += 360
        return heading

    def job(self):
        while not self.stop_thread:
            if self.ms5837.read():
                temp = self.ms5837.temperature()
                press = self.ms5837.pressure()
                depth = self.ms5837.depth()
            else:
                temp, press, depth = 0, 0, 0

            heading = self.read_heading()
            self.log_measurement(temp, press, depth, heading)
            print(f"Temp: {temp:.2f} °C | Pression: {press:.2f} mbar | Profondeur: {depth:.2f} m | Azimut: {heading:.2f} °")
            time.sleep(0.2)

    def start(self):
        try:
            self.stop_thread = False
            self.thread.start()
        except:
            return False
        return True

    def stop(self):
        try:
            self.stop_thread = True
            self.thread.join()
        except:
            return False
        return True

