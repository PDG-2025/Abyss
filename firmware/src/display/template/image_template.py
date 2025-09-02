from PIL import Image, ImageDraw, ImageFont

try:
    FT_BIG = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    FT_SMALL = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 23)
except:
    FT_BIG = ImageFont.load_default()
    FT_SMALL = ImageFont.load_default()

class ImageTemplate:
    def __init__(self):
        self.width = 480
        self.height = 320
        self.background = "#d3d3d3" # gris clair
        self.fields = {}

    def add_field(self, name, x, y, font):
        self.fields[name] = {
            'pos': (x,y),
            'value': "-1",
            'font': font
        }
    def modify_field(self, name, value):
        self.fields[name]['value'] = value

    def generate_image(self):
        img = Image.new("RGB", (self.width, self.height), self.background)
        draw = ImageDraw.Draw(img)

        for field, info in self.fields.items():
            pos = info['pos']
            value = info['value']
            font = info['font']
            draw.text((pos[0], pos[1]), value, font=font, fill="black")

        return img

    def update(self):
        pass

