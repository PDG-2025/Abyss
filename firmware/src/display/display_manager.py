import time, threading
from PIL import Image, ImageDraw, ImageFont
from PIL.ImageChops import screen
from display.screens.general_screen import GeneralScreen
from display.screens.config_screen import ConfigScreen
from display.screens.palier_screen import PalierScreen
from utils.utils import BUTTON

FBDEV = "/dev/fb1"


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
        self.thread = threading.Thread(target=self.job)
        self.stop_thread = True

    def press_back(self):
        with self.screen_lock:
            self.screen.update(BUTTON.BACK_BUTTON)
    def press_up(self):
        with self.screen_lock:
            self.screen.update(BUTTON.UP_BUTTON)
    def press_down(self):
        with self.screen_lock:
            self.screen.update(BUTTON.DOWN_BUTTON)
    def press_enter(self):
        with self.screen_lock:
            return self.screen.update(BUTTON.ENTER_BUTTON)

    def set_screen(self, screen):
        with self.screen_lock:
            self.screen = screen

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
            time.sleep(0.3)

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
        except:
            return False
        return True

    def update_display(self):
        with self.screen_lock:
            self.screen.update_info()
            img = self.screen.generate_image()
            img.show()
        # envoyer vers framebuffer
        self.display.seek(0)
        self.display.write(self.image_to_rgb565(img))

if __name__ == "__main__":
    dm = DisplayManager()
