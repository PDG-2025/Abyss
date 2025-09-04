import time, threading

from display.screens.exit_screen import ExitScreen
from display.screens.general_screen import GeneralScreen
from display.screens.config_screen import ConfigScreen
from display.screens.palier_screen import PalierScreen
from utils.utils import BUTTON, CONF_OPT, FBDEV




def init_display():
    try:
        fb = open(FBDEV, "wb")
    except:
        print(f"Impossible d'ouvrir {FBDEV}, mode simulation")
        return None
    return fb


class DisplayManager:
    def __init__(self):
        self.screen = ConfigScreen()
        self.screen_lock = threading.Lock()
        self.display = init_display()
        self.thread = None
        self.stop_thread = True
        self.dive_start = None
        self.palier_start = None
        self.at_palier = None
        self.gaz_per = None

    def calibrated(self, it_is):
        if it_is:
            self.screen.compas = CONF_OPT.CMP_OK
        else:
            self.screen.compas = CONF_OPT.CMP_NOT

    def dive_mode(self):
        with self.screen_lock:
            self.dive_start = time.time()
            self.gaz_per = self.screen.get_per()/100
            self.stop()
            self.screen = GeneralScreen()
            self.start()

    def is_in_dive_mode(self):
        return (isinstance(self.screen, GeneralScreen)
                | isinstance(self.screen, PalierScreen)
                | isinstance(self.screen, ExitScreen))

    def dive_time(self):
        """Retourne le temps écoulé depuis `debut` (timestamp) sous forme HH:MM"""
        secondes = int(time.time() - self.dive_start)
        minutes, secondes = divmod(secondes, 60)
        return f"{minutes:03d}:{secondes:02d}"

    def config_mode(self):
        with self.screen_lock:
            self.screen = ConfigScreen()

    def press_back(self):
        with self.screen_lock:
            if self.is_in_dive_mode():
                self.stop()
                self.screen = ExitScreen()
                self.start()
            else:
                self.screen.update(BUTTON.BACK_BUTTON)
    def press_up(self):
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
        with self.screen_lock:
            return self.screen.update(BUTTON.ENTER_BUTTON)

    def image_to_rgb565(self, img):
        """Convertit une image PIL RGB en bytes RGB565"""
        arr = bytearray()
        for r, g, b in img.getdata():
            rgb = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
            arr.append((rgb >> 8) & 0xFF)
            arr.append(rgb & 0xFF)
        return bytes(arr)

    def job(self):
        while not self.stop_thread:
            self.update_display()
            time.sleep(0.1)

    def start(self):
        try:
            self.stop_thread = False
            self.thread = threading.Thread(target=self.job)
            self.thread.start()
        except Exception as e:
            print(e)
            return False
        return True

    def stop(self):
        try:
            self.stop_thread = True
            self.thread.join()
        except:
            return False
        return True

    def update_display(self):
        with self.screen_lock:
            img = self.screen.generate_image()
        # envoyer vers framebuffer
        self.display.seek(0)
        self.display.write(self.image_to_rgb565(img))