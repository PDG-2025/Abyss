from datetime import datetime
from enum import Enum
from utils.utils import BUTTON
from display.screens.template_screen import TemplateScreen, FT_SMALL, FT_BIG

class SELECTOR(Enum):
    NON = (135, 150)
    OUI = (335, 150)

class ExitScreen(TemplateScreen):
    def __init__(self):
        super().__init__()
        self.quit = SELECTOR.NON
        self.add_field("val_time", 10, 0, FT_SMALL)
        self.add_field("stop_dive", 20, 100, FT_BIG)
        self.modify_field("stop_dive", "Arrêter la plongée ? ")
        self.add_field("non", 100, 200, FT_BIG)
        self.modify_field("non", "NON")
        self.add_field("oui", 300, 200, FT_BIG)
        self.modify_field("oui", "OUI")
        self.add_field("selector", 135, 150, FT_BIG)
        self.modify_field("selector", "↓")

    def move_selector(self):
        if self.quit == SELECTOR.NON:
            self.quit = SELECTOR.OUI
        else:
            self.quit = SELECTOR.NON
        self.modifiy_x_y("selector", self.quit.value)

    def update_values(self, sensor_raw, timer):
        pass

    def update(self, button):
        match button:
            case BUTTON.BACK_BUTTON:
                return False
            case (BUTTON.UP_BUTTON
                | BUTTON.DOWN_BUTTON):
                self.move_selector()
            case BUTTON.ENTER_BUTTON:
                if self.quit == SELECTOR.NON:
                    return False
                else:
                    return True
