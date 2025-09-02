import time
from sensors.sensors import SensorsManager

def main():
    print("first")
    sensors = SensorsManager()
    
    print("cal")
    sensors.calibrate_qmc5883l()

    print(sensors.is_calibrated())

    print("start")
    sensors.start()

    print("sleep")
    time.sleep(10)
    sensors.stop()

    print("Job over")

    return True

main()