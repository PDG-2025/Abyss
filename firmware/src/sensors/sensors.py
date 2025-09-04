import time, math, smbus2, json, threading
from datetime import datetime
import ms5837
from utils.utils import LOG_FILE, LOCK_JSON

QMC5883L_BUS = 1
QMC5883L_ADDR = 0x0D
QMC5883L_REGISTER = 0x09
QMC5883L_VALUE = 0b00011101


def init_ms5837():
    # --- MS5837 (pression + température) ---
    sensor = ms5837.MS5837_30BA()
    if not sensor.init():
        print("Erreur : MS5837 non détecté")
        return None
    return sensor

def init_qmc5883l():
    # --- QMC5883L (boussole) ---
    try:
        bus = smbus2.SMBus(QMC5883L_BUS)
        bus.write_byte_data(QMC5883L_ADDR, QMC5883L_REGISTER, QMC5883L_VALUE)  # config
    except:
        print("Erreur : qmc5883l non détecté")
        return None
    return bus


class SensorsManager:
    def __init__(self):
        self.ms5837 = init_ms5837()
        self.qmc5883l = init_qmc5883l()
        self.x_offset = None
        self.y_offset = None
        self.stop_thread = True
        self.thread = threading.Thread(target=self.job)
        self.sensors_data_lock = threading.Lock()
        self.sensors_data = {
            'temp': None,
            'press': None,
            'depth': None,
            'azimuth': None
        }

    def get_data(self):
        with self.sensors_data_lock:
            return [self.sensors_data['temp'],
                    self.sensors_data['press'],
                    self.sensors_data['depth'],
                    self.sensors_data['azimuth']
                    ]

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

    def check_ms5837(self):
        if self.ms5837 is None:
            return False
        return True

    def check_qmc5883l(self):
        if self.qmc5883l is None:
            return False
        return True


    def log_measurement(self):
        """Stocke une mesure dans un fichier JSON avec un horodatage"""
        data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",  # temps UTC format ISO 8601
            "temperature_c": self.sensors_data['temp'],
            "pression_mbar": self.sensors_data['press'],
            "profondeur_m": self.sensors_data['depth'],
            "azimut_deg": self.sensors_data['azimut']
        }
        # lire l’ancien contenu
        with LOCK_JSON:
            try:
                with open(LOG_FILE, "r") as f:
                    mesures = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                mesures = []
        # ajouter la nouvelle mesure
        mesures.append(data)
        # sauvegarder
        with LOCK_JSON:
            with open(LOG_FILE, "w") as f:
                json.dump(mesures, f, indent=2)

        return True

    def read_heading(self):
        if not self.is_calibrated():
            return -1
        x, y, z = self.read_raw_qmc5883l()
        x -= self.x_offset
        y -= self.y_offset
        heading = math.degrees(math.atan2(y, x))
        if heading < 0:
            heading += 360
        return heading

    def job(self):
        while not self.stop_thread:
            with self.sensors_data_lock:
                try:
                    self.sensors_data['azimut'] = self.read_heading()
                    if self.ms5837.read():
                        self.sensors_data['temp'] = self.ms5837.temperature()
                        self.sensors_data['press'] = self.ms5837.pressure()
                        self.sensors_data['depth'] = self.ms5837.depth() + 0.6
                        if self.sensors_data["depth"] < 0:
                            self.sensors_data["depth"] = 0
                        self.log_measurement()
                except Exception as e:
                    print("sensors reading error : ", e)
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
            print("sensors stopped.")
        except:
            return False
        return True
