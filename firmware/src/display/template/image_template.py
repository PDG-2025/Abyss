from PIL import Image, ImageDraw, ImageFont

try:
    FT_BIG = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    FT_SMALL = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
except:
    FT_BIG = ImageFont.load_default()
    FT_SMALL = ImageFont.load_default()
    print("Default")

class ImageTemplate:
    def __init__(self, template_path):
        self.width = 480
        self.height = 320
        self.template_path = template_path
        self.fields = {}

    def add_field(self, name, x, y):
        self.fields[name] = {
            'pos': (x,y),
            'value': "-1"
        }
    def modify_field(self, name, value):
        self.fields[name]['value'] = value

    def generate_image(self):
        img = Image.open(self.template_path)
        draw = ImageDraw.Draw(img)

        for field, info in self.fields.items():
            pos = info['pos']
            value = info['value']
            draw.text((pos[0], pos[1]), value, font=FT_SMALL, fill="black")

        return img

