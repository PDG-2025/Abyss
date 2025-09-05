import time, threading

from display.screens.exit_screen import ExitScreen
from display.screens.general_screen import GeneralScreen
from display.screens.config_screen import ConfigScreen
from display.screens.palier_screen import PalierScreen
from utils.utils import BUTTON, CONF_OPT, init_display


class DisplayManager:
    """Gestionnaire central de l'affichage"""

    def __init__(self):
        # Initiate Attributs
        self.display = init_display()
        self.screen = ConfigScreen()
        self.dive_start = None
        self.gaz_per = None

        # Initiate Thread attributs
        self.screen_lock = threading.Lock()
        self.thread = None
        self.stop_thread = True

    def dive_mode(self):
        """Passe en mode plongée"""
        with self.screen_lock:
            self.dive_start = time.time()
            self.gaz_per = self.screen.get_per() / 100
            self.stop()
            self.screen = GeneralScreen()
            self.start()

    def is_in_dive_mode(self):
        return (
            isinstance(self.screen, GeneralScreen)
            | isinstance(self.screen, PalierScreen)
            | isinstance(self.screen, ExitScreen)
        )

    def config_mode(self):
        """Passe en mode configuration"""
        with self.screen_lock:
            self.screen = ConfigScreen()

    def dive_time(self):
        """Retourne la durée écoulée depuis le début de la plongée au format MM:SS."""
        secondes = int(time.time() - self.dive_start)
        minutes, secondes = divmod(secondes, 60)
        return f"{minutes:03d}:{secondes:02d}"

    def calibrated(self, it_is):
        """Met à jour l'état du compas selon la calibration."""
        if it_is:
            self.screen.compas = CONF_OPT.CMP_OK
        else:
            self.screen.compas = CONF_OPT.CMP_NOT

    def press_back(self):
        """Traite la pression du bouton BACK selon le mode et l'écran courant."""
        with self.screen_lock:
            if self.is_in_dive_mode():
                self.stop()
                self.screen = ExitScreen()
                self.start()
            else:
                self.screen.update(BUTTON.BACK_BUTTON)

    def press_up(self):
        """Traite la pression du bouton UP et change l'écran si en mode plongée."""
        with self.screen_lock:
            if self.is_in_dive_mode() and not isinstance(self.screen, ExitScreen):
                self.stop()
                if isinstance(self.screen, GeneralScreen):
                    self.screen = PalierScreen()
                elif isinstance(self.screen, PalierScreen):
                    self.screen = GeneralScreen()
                self.start()
            else:
                self.screen.update(BUTTON.UP_BUTTON)

    def press_down(self):
        """Traite la pression du bouton DOWN et change l'écran si en mode plongée."""
        with self.screen_lock:
            if self.is_in_dive_mode() and not isinstance(self.screen, ExitScreen):
                self.stop()
                if isinstance(self.screen, GeneralScreen):
                    self.screen = PalierScreen()
                else:
                    self.screen = GeneralScreen()
                self.start()
            else:
                self.screen.update(BUTTON.DOWN_BUTTON)

    def press_enter(self):
        """Traite la pression du bouton ENTER et renvoie le résultat de l'action de l'écran."""
        with self.screen_lock:
            return self.screen.update(BUTTON.ENTER_BUTTON)

    def image_to_rgb565(self, img):
        """Convertit une image PIL en format RGB565 pour l'affichage."""
        arr = bytearray()
        for r, g, b in img.getdata():
            rgb = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
            arr.append((rgb >> 8) & 0xFF)
            arr.append(rgb & 0xFF)
        return bytes(arr)

    def update_display(self):
        with self.screen_lock:
            img = self.screen.generate_image()
        # Send image to buffer
        self.display.seek(0)
        self.display.write(self.image_to_rgb565(img))

    def job(self):
        """Boucle principale du thread qui met à jour l'affichage."""
        while not self.stop_thread:
            try:
                self.update_display()
                time.sleep(0.1)
            except Exception as e:
                print("DM job exception:", e)

    def start(self):
        """Démarre le thread de mise à jour de l'affichage."""
        try:
            self.stop_thread = False
            self.thread = threading.Thread(target=self.job)
            self.thread.start()
        except Exception as e:
            print("DM start exception:", e)
            return False
        return True

    def stop(self):
        """Arrête le thread de mise à jour de l'affichage."""
        try:
            self.stop_thread = True
            self.thread.join()
        except Exception as e:
            print("DM stop exception:", e)
            return False
        return True
