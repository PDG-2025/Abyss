import time
from button.buttons import ButtonManager
from display.display_manager import DisplayManager
#from sensors.sensors import SensorsManager
from utils.utils import PHASE


def main():
    dm = DisplayManager()
    bm = ButtonManager(dm, None)
    dm.start()
    bm.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        dm.stop()
        bm.stop()


if __name__ == "__main__":
    main()
