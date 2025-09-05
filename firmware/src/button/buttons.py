import time, threading
import RPi.GPIO as GPIO
from display.screens.exit_screen import ExitScreen
from display.screens.general_screen import GeneralScreen
from utils.utils import CONF_OPT


class ButtonManager:
    """Gestionnaire des boutons GPIO pour l'affichage et les capteurs."""

    def __init__(self, display, sensors):
        """Initialise le ButtonManager.

        @param display: instance responsable de l'interface utilisateur (écrans, méthodes press_*)
        @param sensors: instance gérant les capteurs (start/stop, calibrations, état)
        """
        # Initiate button PIN const
        self.PINS = [5, 6, 13, 26]

        # Initiate threads
        self.stop_thread = True
        self.thread = threading.Thread(target=self.job)

        # Retrieve parameters
        self.display = display
        self.sensors = sensors

    def action(self, channel):
        """Callback exécuté lorsqu'un événement GPIO est détecté sur une broche.

        @param channel: int - numéro BCM de la broche ayant déclenché l'événement
        @return: None
        """
        if channel == 5:
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
                        print("Bluetooth not implemented")
                    case False:
                        self.display.screen = GeneralScreen()
        elif channel == 6:
            self.display.press_down()

        elif channel == 13:
            self.display.press_up()

        elif channel == 26:
            self.display.press_back()

    def job(self):
        """Boucle d'arrière-plan exécutée par `thread` pour surveiller les GPIO."""
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.PINS, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
        for pin in self.PINS:
            GPIO.remove_event_detect(pin)  # Clean previous config
            GPIO.add_event_detect(
                pin, GPIO.RISING, callback=self.action, bouncetime=300
            )

        while not self.stop_thread:
            time.sleep(0.1)

    def start(self):
        """Démarre le thread de surveillance des boutons.

        @return: bool - True si le thread a été lancé avec succès, False sinon.
        """
        try:
            self.stop_thread = False
            self.thread.start()
        except Exception as e:
            print("BM start exception:", e)
            return False
        return True

    def stop(self):
        """Arrête proprement le thread de surveillance et libère la ressource.

        @return: bool - True si l'arrêt et la jonction se sont déroulés correctement, False sinon.
        """
        try:
            self.stop_thread = True
            self.thread.join()
        except Exception as e:
            print("BM stop exception:", e)
            return False
        return True
