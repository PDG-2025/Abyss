import pytest
import threading
from unittest.mock import Mock, patch
from PIL import Image

# Import des classes à tester
from display.display_manager import DisplayManager
from display.screens.template_screen import TemplateScreen
from display.screens.config_screen import ConfigScreen
from display.screens.general_screen import GeneralScreen
from display.screens.palier_screen import PalierScreen
from display.screens.exit_screen import ExitScreen
from utils.utils import BUTTON, CONF_OPT, EXIT_SELECTOR, FT_SMALL


class TestTemplateScreen:

    @patch("PIL.Image.new")
    @patch("PIL.ImageDraw.Draw")
    def test_generate_image(self, mock_draw, mock_image):
        screen = TemplateScreen()
        mock_img = Mock()
        mock_image.return_value = mock_img
        mock_drawer = Mock()
        mock_draw.return_value = mock_drawer

        screen.add_field("test", 10, 20, FT_SMALL)
        screen.modify_field("test", "texte")

        result = screen.generate_image()

        mock_image.assert_called_once_with("RGB", (480, 320), "#d3d3d3")
        mock_draw.assert_called_once_with(mock_img)
        mock_drawer.text.assert_called_once_with(
            (10, 20), "texte", font=FT_SMALL, fill="black"
        )
        assert result == mock_img

    def test_update_default(self):
        screen = TemplateScreen()
        result = screen.update(BUTTON.UP_BUTTON)
        assert result is None


class TestConfigScreen:

    def test_phase_navigation(self):
        screen = ConfigScreen()
        original_phase = screen.phase

        # Test up_phase
        screen.down_phase()
        screen.up_phase()
        assert screen.phase == original_phase

        # Test down_phase
        screen.down_phase()
        assert screen.phase != original_phase


class TestGeneralScreen:
    """Tests pour GeneralScreen"""

    @patch("display.screens.general_screen.datetime")
    @patch("display.screens.general_screen.up_down_from_file")
    def test_update_values(self, mock_up_down, mock_datetime):
        screen = GeneralScreen()

        # Mock des dépendances
        mock_datetime.now.return_value.strftime.return_value = "12:34:56"
        mock_up_down.return_value = "1.5"

        # Données de capteur factices
        sensor_raw = [
            25.5,
            0,
            15.2,
            0,
            30,
            45,
            3,
            5,
        ]  # temp, _, depth, _, mod, ndl, palier, palier_time
        timer = "05:30"

        screen.update_values(sensor_raw, timer)

        assert screen.fields["val_time"]["value"] == "12:34:56"
        assert screen.fields["val_temp"]["value"] == "25.50"
        assert screen.fields["val_depth"]["value"] == "15.20"
        assert screen.fields["val_mod"]["value"] == "30"
        assert screen.fields["val_ndl"]["value"] == 45
        assert screen.fields["val_timer"]["value"] == "05:30"

    def test_update(self):
        screen = GeneralScreen()
        result = screen.update(BUTTON.UP_BUTTON)
        assert result is None


class TestExitScreen:
    """Tests pour ExitScreen"""

    def test_move_selector(self):
        screen = ExitScreen()

        # Initialement sur NON
        assert screen.quit == EXIT_SELECTOR.NON

        # Déplacer vers OUI
        screen.move_selector()
        assert screen.quit == EXIT_SELECTOR.OUI

        # Retour vers NON
        screen.move_selector()
        assert screen.quit == EXIT_SELECTOR.NON

    def test_update_back_button(self):
        screen = ExitScreen()
        result = screen.update(BUTTON.BACK_BUTTON)
        assert result is False

    def test_update_navigation_buttons(self):
        screen = ExitScreen()

        # Test UP_BUTTON
        original_quit = screen.quit
        screen.update(BUTTON.UP_BUTTON)
        assert screen.quit != original_quit

        # Test DOWN_BUTTON
        screen.update(BUTTON.DOWN_BUTTON)
        assert screen.quit == original_quit

    def test_update_enter_button(self):
        screen = ExitScreen()

        # Avec NON sélectionné
        screen.quit = EXIT_SELECTOR.NON
        result = screen.update(BUTTON.ENTER_BUTTON)
        assert result is False

        # Avec OUI sélectionné
        screen.quit = EXIT_SELECTOR.OUI
        result = screen.update(BUTTON.ENTER_BUTTON)
        assert result is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
