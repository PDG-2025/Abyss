import time
import st7789
from PIL import Image, ImageDraw, ImageFont
from template.image_template import ImageTemplate

def image_to_rgb565(img):
    """Convertit une image PIL RGB en bytes RGB565"""
    arr = bytearray()
    for r, g, b in img.getdata():
        rgb = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
        arr.append((rgb >> 8) & 0xFF)
        arr.append(rgb & 0xFF)
    return bytes(arr)

FBDEV = "/dev/fb1"

def init_display():
    try:
        fb = open(FBDEV, "wb")
        return fb
    except:
        print(f"Impossible d'ouvrir {FBDEV}, mode simulation")
        return None

def update_display(fb, template):
    template = ImageTemplate(template)

    template.add_field("test", 311, 246)

    template.modify_field("test", "Ceci est un test")

    img = template.generate_image()

    img.show()

    # envoyer vers framebuffer
    #fb.seek(0)
    #fb.write(image_to_rgb565(img))
    #time.sleep(0.5)

# Code pour lancer l'app
if __name__ == "__main__":
    fb = init_display()
    update_display(fb, "template/png/test.png")
    if fb:
        fb.close()