import threading
from PIL import Image, ImageDraw


class TemplateScreen:
    """Classe de base pour la gestion d'un écran graphique simple."""

    def __init__(self):
        # Initiate Attributs
        self.width = 480
        self.height = 320
        self.background = "#d3d3d3"  # light grey
        self.fields = {}
        # Initiate Threading
        self.fields_lock = threading.Lock()

    def add_field(self, name, x, y, font):
        """Ajoute un champ textuel au dictionnaire `fields`."""
        with self.fields_lock:
            self.fields[name] = {"pos": (x, y), "value": "", "font": font}

    def modify_field(self, name, value):
        """Modifie la valeur textuelle d'un champ existant."""
        with self.fields_lock:
            self.fields[name]["value"] = value

    def modifiy_x_y(self, name, x_y):
        """Met à jour la position (x, y) d'un champ existant."""
        with self.fields_lock:
            self.fields[name]["pos"] = x_y

    def generate_image(self):
        """Construit et retourne une image PIL représentant l'écran actuel.

        @return: PIL.Image.Image — objet image prêt à être affiché ou envoyé vers un écran.
        """
        img = Image.new("RGB", (self.width, self.height), self.background)
        draw = ImageDraw.Draw(img)
        with self.fields_lock:
            for field, info in self.fields.items():
                pos = info["pos"]
                value = info["value"]
                font = info["font"]
                draw.text((pos[0], pos[1]), value, font=font, fill="black")
        return img

    def update(self, button):
        pass
