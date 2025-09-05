import pytest
from unittest.mock import Mock, patch

# Import des classes à tester
from display_manager import DisplayManager
from display.screens.template_screen import TemplateScreen
from display.screens.config_screen import ConfigScreen
from display.screens.general_screen import GeneralScreen
from display.screens.palier_screen import PalierScreen
from display.screens.exit_screen import ExitScreen
from utils.utils import BUTTON, CONF_OPT, EXIT_SELECTOR, FT_SMALL


class TestTemplateScreen:
    def test_add_modify_field(self):
        screen = TemplateScreen()
        screen.add_field("test", 10, 20, FT_SMALL)
        screen.modify_field("test", "valeur")
        assert screen.fields["test"]["value"] == "valeur"


class TestConfigScreen:
    def test_init(self):
        screen = ConfigScreen()
        assert screen.gaz_p == 21
        assert screen.gaz == CONF_OPT.AIR

    def test_set_gaz(self):
        screen = ConfigScreen()
        screen.set_gaz()  # AIR -> NITROX
        assert screen.gaz == CONF_OPT.NITROX

        screen.set_gaz()  # NITROX -> AIR
        assert screen.gaz == CONF_OPT.AIR
        assert screen.gaz_p == 21


class TestGeneralScreen:
    @patch("display.screens.general_screen.up_down_from_file", return_value="1.5")
    def test_update_values(self, mock_up_down):
        screen = GeneralScreen()
        sensor_raw = [25.5, 0, 15.2, 0, 30, 45, 3, 5]
        screen.update_values(sensor_raw, "05:30")
        assert screen.fields["val_temp"]["value"] == "25.50"
        assert screen.fields["val_depth"]["value"] == "15.20"


class TestPalierScreen:
    @patch("display.screens.palier_screen.up_down_from_file", return_value="2.0")
    def test_update_values(self, mock_up_down):
        screen = PalierScreen()
        sensor_raw = [25.5, 0, 18.5, 0, 35, 20, 6, 8]
        screen.update_values(sensor_raw, "08:15")
        assert screen.fields["val_ndl"]["value"] == 20
        assert screen.fields["val_palier"]["value"] == 6


class TestExitScreen:
    def test_move_selector(self):
        screen = ExitScreen()
        assert screen.quit == EXIT_SELECTOR.NON
        screen.move_selector()
        assert screen.quit == EXIT_SELECTOR.OUI

    def test_update_enter(self):
        screen = ExitScreen()
        screen.quit = EXIT_SELECTOR.NON
        assert screen.update(BUTTON.ENTER_BUTTON) is False

        screen.quit = EXIT_SELECTOR.OUI
        assert screen.update(BUTTON.ENTER_BUTTON) is True


class TestDisplayManager:
    @patch("display_manager.init_display")
    def test_init(self, mock_init_display):
        dm = DisplayManager()
        assert isinstance(dm.screen, ConfigScreen)
        assert dm.dive_start is None

    @patch("display_manager.init_display")
    @patch("time.time", return_value=1100)
    def test_dive_time(self, mock_time, mock_init_display):
        dm = DisplayManager()
        dm.dive_start = 1000  # 100 secondes
        assert dm.dive_time() == "001:40"

    @patch("display_manager.init_display")
    def test_is_in_dive_mode(self, mock_init_display):
        dm = DisplayManager()
        assert not dm.is_in_dive_mode()

        dm.screen = GeneralScreen()
        assert dm.is_in_dive_mode()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
