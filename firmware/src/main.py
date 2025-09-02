import time
from sensors.sensors import SensorsManager




def main():
    sensors = SensorsManager()

    sensors.calibrate_qmc5883l()

    print(sensors.is_calibrated())

    sensors.start()

    time.sleep(10)
    sensors.stop()

    print("Job over")

    return True

