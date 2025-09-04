import RPi.GPIO as GPIO
import time, threading
from display.display_manager import DisplayManager
from display.screens.exit_screen import ExitScreen
from display.screens.general_screen import GeneralScreen
from utils.utils import CONF_OPT

class ButtonManager:
    def __init__(self, display, sensors):
        self.PINS = [5, 6, 13, 26]
        self.thread = threading.Thread(target=self.job)
        self.stop_thread = True
        self.display = display
        self.sensors = sensors

    def action(self, channel):
        """Fonction déclenchée quand un bouton est pressé"""
        if channel == 5:
            print("Bouton sur GPIO 5 appuyé → Action 1")
            need_attention = self.display.press_enter()
            if need_attention is not None:
                match need_attention:
                    case True:
                        if isinstance(self.display.screen, ExitScreen):
                            self.sensors.stop()
                            self.display.config_mode()
                        else:
                            self.sensors.start()
                            self.display.dive_mode()
                    case CONF_OPT.CMP_CL:
                        self.sensors.calibrate_qmc5883l()
                        self.display.calibrated(self.sensors.is_calibrated())
                    case CONF_OPT.BLE_CN:
                        print("Add bluetooth connection")
                    case False:
                        self.display.screen = GeneralScreen()
        elif channel == 6:
            print("Bouton sur GPIO 6 appuyé → Action 2")
            self.display.press_down()

        elif channel == 13:
            print("Bouton sur GPIO 13 appuyé → Action 3")
            self.display.press_up()

        elif channel == 26:
            print("Bouton sur GPIO 26 appuyé → Action 4")
            self.display.press_back()

    def job(self):
        # Configuration GPIO
        GPIO.setmode(GPIO.BCM)  # mode BCM (numéros GPIO, pas les numéros physiques)
        GPIO.setup(self.PINS, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
        # Détection des événements
        for pin in self.PINS:
            GPIO.remove_event_detect(pin)
            GPIO.add_event_detect(pin, GPIO.RISING, callback=self.action, bouncetime=300)

        while not self.stop_thread:
            time.sleep(0.1)

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
            print("ButtonManager stopped.")
        except:
            return False
        return True

    def cleanup(self):
        GPIO.cleanup()