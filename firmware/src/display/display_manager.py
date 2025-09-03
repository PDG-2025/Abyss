import time, st7789, threading
from PIL import Image, ImageDraw, ImageFont
from display.screens.general_screen import GeneralScreen
from display.screens.config_screen import ConfigScreen
from display.screens.palier_screen import PalierScreen
from display.screens.gaz_screen import GazScreen
from display.screens.status_screen import StatusScreen
from enum import Enum

CONFIG_PHASE = 0
DIVE_PHASE = 1
FBDEV = "/dev/fb1"


class CONFIG_SCREEN(Enum):
    WELCOME = None
    CONFIG = 0,
    STATUS = 1,
    GAZ = 2,

class DIVE_SCREEN(Enum):
    GENERAL = 0,
    PALIER = 1,
    COMPASS = 2

def init_display():
    try:
        fb = open(FBDEV, "wb")
        return fb
    except:
        print(f"Impossible d'ouvrir {FBDEV}, mode simulation")
        return None


class DisplayManager:
    def __init__(self):
        self.current_screen = CONFIG_SCREEN.WELCOME
        self.phase = CONFIG_PHASE
        self.display = init_display()


    def image_to_rgb565(img):
        """Convertit une image PIL RGB en bytes RGB565"""
        arr = bytearray()
        for r, g, b in img.getdata():
            rgb = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
            arr.append((rgb >> 8) & 0xFF)
            arr.append(rgb & 0xFF)
        return bytes(arr)



def update_display(fb):



    screen = GeneralScreen()

    screen.modify_field("val_time", "00:00:00")
    screen.modify_field("val_battery", "000")
    screen.modify_field("val_pressure", "000")
    screen.modify_field("val_ndl", "00")
    screen.modify_field("val_depth", "00.0")
    screen.modify_field("val_updown", "↑ 00.0")
    screen.modify_field("val_temp", "00.0")
    screen.modify_field("val_mod", "000")
    screen.modify_field("val_palier", "000")
    screen.modify_field("val_timer", "00:00")

    img = screen.generate_image()

    img.show()



    screen = ConfigScreen()

    screen.modify_field("val_gaz", "NITROX")
    screen.modify_field("val_gaz_perc", "00")
    screen.modify_field("val_alarme", "Vitesse / MOD")
    screen.modify_field("val_compas", "non-calibré")

    img = screen.generate_image()

    img.show()


    screen = PalierScreen()

    screen.modify_field("val_time", "00:00:00")
    screen.modify_field("val_battery", "000")
    screen.modify_field("val_pressure", "000")
    screen.modify_field("val_ndl", "00")
    screen.modify_field("val_depth", "00.0")
    screen.modify_field("val_updown", "↑ 00.0")
    screen.modify_field("val_palier_time", "00")
    screen.modify_field("val_palier", "000")
    screen.modify_field("val_timer", "00:00")

    img = screen.generate_image()

    img.show()


    screen = GazScreen()

    screen.modify_field("val_mod", "000")
    screen.modify_field("val_nitrox", "00% O²")
    img = screen.generate_image()

    img.show()


    screen = StatusScreen()

    screen.modify_field("val_battery", "00%")
    screen.modify_field("val_cpress", "ON")
    screen.modify_field("val_compas", "Calibré")
    screen.modify_field("val_ble", "Connecté")

    img = screen.generate_image()

    img.show()


    # envoyer vers framebuffer
    #fb.seek(0)
    #fb.write(image_to_rgb565(img))
    #time.sleep(0.5)

# Code pour lancer l'app
if __name__ == "__main__":
    fb = init_display()
    update_display(fb)
    if fb:
        fb.close()