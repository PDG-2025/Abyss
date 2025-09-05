from datetime import datetime, timezone, timedelta
from display.screens.template_screen import TemplateScreen
from utils.utils import up_down_from_file, FT_SMALL, FT_BIG


class PalierScreen(TemplateScreen):
    """Écran affichant les informations liées aux paliers de décompression"""

    def __init__(self):
        super().__init__()
        # Initiate Indicators
        self.add_field("ind_pressure", 430, 0, FT_SMALL)
        self.modify_field("ind_pressure", "BAR")
        self.add_field("ind_ndl", 30, 75, FT_BIG)
        self.modify_field("ind_ndl", "NDL")
        self.add_field("ind_ndl_time", 90, 130, FT_SMALL)
        self.modify_field("ind_ndl_time", "MIN")
        self.add_field("ind_depth", 290, 110, FT_SMALL)
        self.modify_field("ind_depth", "m")
        self.add_field("ind_updown", 370, 134, FT_SMALL)
        self.modify_field("ind_updown", "m/min")
        self.add_field("ind_palier", 60, 190, FT_SMALL)
        self.modify_field("ind_palier", "Palier:")
        self.add_field("ind_palier_unit", 150, 235, FT_SMALL)
        self.modify_field("ind_palier_unit", "m")
        self.add_field("ind_palier_time", 270, 190, FT_SMALL)
        self.modify_field("ind_palier_time", "Temps restant:")
        self.add_field("ind_palier_time_unit", 330, 235, FT_SMALL)
        self.modify_field("ind_palier_time_unit", "MIN")
        self.add_field("ind_timer", 95, 280, FT_SMALL)
        self.modify_field("ind_timer", "Durée plongée:")

        # Initiate Values
        self.add_field("val_time", 10, 0, FT_SMALL)
        self.add_field("val_battery", 215, 0, FT_SMALL)
        self.add_field("val_pressure", 385, 0, FT_SMALL)
        self.add_field("val_ndl", 30, 115, FT_BIG)
        self.add_field("val_depth", 170, 95, FT_BIG)
        self.add_field("val_updown", 320, 95, FT_BIG)
        self.add_field("val_palier", 60, 220, FT_BIG)
        self.add_field("val_palier_time", 270, 220, FT_BIG)
        self.add_field("val_timer", 290, 280, FT_SMALL)

    def update_values(self, sensor_raw, timer):
        self.modify_field(
            "val_time", datetime.now(timezone(timedelta(hours=2))).strftime("%H:%M:%S")
        )
        self.modify_field("val_battery", "00" + "%")
        self.modify_field("val_pressure", "000")
        self.modify_field("val_ndl", sensor_raw[5])
        self.modify_field("val_depth", f"{sensor_raw[2]:.2f}")
        self.modify_field("val_updown", up_down_from_file())
        self.modify_field("val_palier", sensor_raw[6])
        self.modify_field("val_palier_time", sensor_raw[7])
        self.modify_field("val_timer", str(timer))

    def update(self, button):
        return None  # Update of the screen is done by DisplayManager
