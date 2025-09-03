import time

from button.buttons import ButtonManager
from display.display_manager import DisplayManager
from sensors.sensors import SensorsManager

def main():
    while True:
        dm = DisplayManager()
        bm = ButtonManager()

        dm.start()
        bm.start()


if __name__ == "__main__":
    main()
