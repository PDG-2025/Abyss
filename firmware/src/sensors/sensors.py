import time, math, json, threading
from datetime import datetime
from utils.utils import LOG_FILE, LOCK_JSON, init_ms5837, init_qmc5883l, QMC5883L_ADDR


class SensorsManager:
    """Gestionnaire des capteurs de plongée"""

    def __init__(self):
        # Initiate Attributs
        self.ms5837 = init_ms5837()
        self.qmc5883l = init_qmc5883l()
        self.x_offset = None
        self.y_offset = None
        self.sensors_data = {
            "temp": None,
            "press": None,
            "depth": None,
            "azimuth": None,
        }

        # Initiate Threading
        self.stop_thread = True
        self.sensors_data_lock = threading.Lock()
        self.thread = threading.Thread(target=self.job)

    def get_data(self):
        with self.sensors_data_lock:
            return [
                self.sensors_data["temp"],
                self.sensors_data["press"],
                self.sensors_data["depth"],
                self.sensors_data["azimuth"],
            ]

    def calibrate_qmc5883l(self, duration=10):
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

    def is_calibrated(self):
        return self.x_offset is not None and self.y_offset is not None

    def read_raw_qmc5883l(self):
        data = self.qmc5883l.read_i2c_block_data(QMC5883L_ADDR, 0x00, 6)
        x = data[0] | (data[1] << 8)
        y = data[2] | (data[3] << 8)
        z = data[4] | (data[5] << 8)
        if x >= 32768:
            x -= 65536
        if y >= 32768:
            y -= 65536
        if z >= 32768:
            z -= 65536
        return x, y, z

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

    def log_measurement(self):
        """Journalise les mesures courantes dans le fichier JSON"""
        data = {
            "timestamp": datetime.utcnow().isoformat()
            + "Z",  # temps UTC format ISO 8601
            "temperature_c": self.sensors_data["temp"],
            "pression_mbar": self.sensors_data["press"],
            "profondeur_m": self.sensors_data["depth"],
            "azimut_deg": self.sensors_data["azimut"],
        }
        with LOCK_JSON:
            try:
                with open(LOG_FILE, "r") as f:
                    mesures = json.load(f)
            except Exception as e:
                print("Log measurement exception:", e)
                return False
        mesures.append(data)
        with LOCK_JSON:
            with open(LOG_FILE, "w") as f:
                json.dump(mesures, f, indent=2)
        return True

    def job(self):
        """Boucle principale du thread qui lit les capteurs et met à jour les valeurs"""
        while not self.stop_thread:
            with self.sensors_data_lock:
                try:
                    self.sensors_data["azimut"] = self.read_heading()
                    if self.ms5837.read():
                        self.sensors_data["temp"] = self.ms5837.temperature()
                        self.sensors_data["press"] = self.ms5837.pressure()
                        self.sensors_data["depth"] = self.ms5837.depth() + 0.6
                        if self.sensors_data["depth"] < 0:
                            self.sensors_data["depth"] = 0
                        self.log_measurement()
                except Exception as e:
                    print("SM job exception:", e)
            time.sleep(0.2)

    def start(self):
        """Démarre le thread de lecture continue des capteurs."""
        try:
            self.stop_thread = False
            self.thread.start()
        except Exception as e:
            print("SM start exception:", e)
            return False
        return True

    def stop(self):
        """Arrête le thread de lecture des capteurs."""
        try:
            self.stop_thread = True
            self.thread.join()
        except Exception as e:
            print("SM stop exception:", e)
            return False
        return True
