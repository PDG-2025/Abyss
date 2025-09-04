from utils.utils import BUTTON, EXIT_SELECTOR
from display.screens.template_screen import TemplateScreen
from utils.utils import FT_BIG


class ExitScreen(TemplateScreen):
    """Écran de sortie permettant de confirmer ou annuler l'arrêt de la plongée."""

    def __init__(self):
        super().__init__()
        # Initiate Attributs
        self.quit = EXIT_SELECTOR.NON

        # Initiate Indicators
        self.modify_field("stop_dive", "Arrêter la plongée ? ")
        self.add_field("non", 100, 200, FT_BIG)
        self.modify_field("non", "NON")
        self.add_field("oui", 300, 200, FT_BIG)
        self.modify_field("oui", "OUI")

        # Initiate Selectors
        self.add_field("selector", 135, 150, FT_BIG)
        self.modify_field("selector", "↓")

    def move_selector(self):
        if self.quit == EXIT_SELECTOR.NON:
            self.quit = EXIT_SELECTOR.OUI
        else:
            self.quit = EXIT_SELECTOR.NON
        self.modifiy_x_y("selector", self.quit.value)

    def update_values(self, sensor_raw, timer):
        pass  # We don't use because we have no values

    def update(self, button):
        """Traite une entrée utilisateur et met à jour l’état de sortie."""
        match button:
            case BUTTON.BACK_BUTTON:
                return False
            case BUTTON.UP_BUTTON | BUTTON.DOWN_BUTTON:
                self.move_selector()
            case BUTTON.ENTER_BUTTON:
                if self.quit == EXIT_SELECTOR.NON:
                    return False
                else:
                    return True
