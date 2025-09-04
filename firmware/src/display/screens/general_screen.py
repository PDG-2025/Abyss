from display.screens.template_screen import TemplateScreen, FT_SMALL, FT_BIG
from datetime import datetime, timezone, timedelta
from utils.utils import up_down_from_file

class GeneralScreen(TemplateScreen):
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

        self.add_field("ind_temp", 170, 190, FT_SMALL)
        self.modify_field("ind_temp", "C°")
        self.add_field("ind_mod", 245, 190, FT_SMALL)
        self.modify_field("ind_mod", "MOD (m):")

        self.add_field("ind_palier", 95, 235, FT_SMALL)
        self.modify_field("ind_palier", "Prochain palier:")
        self.add_field("ind_palier_m", 335, 235, FT_SMALL)
        self.modify_field("ind_palier_m", "m")

        self.add_field("ind_timer", 95, 280, FT_SMALL)
        self.modify_field("ind_timer", "Durée plongée:")

        # Initiate Values
        self.add_field("val_time", 10, 0, FT_SMALL)
        self.add_field("val_battery", 215, 0, FT_SMALL)
        self.add_field("val_pressure", 385, 0, FT_SMALL)

        self.add_field("val_ndl", 30, 115, FT_BIG)
        self.add_field("val_depth", 170, 95, FT_BIG)
        self.add_field("val_updown", 320, 95, FT_BIG) # ↑ ↓

        self.add_field("val_temp", 100, 190, FT_SMALL)
        self.add_field("val_mod", 360, 190, FT_SMALL)

        self.add_field("val_palier", 290, 235, FT_SMALL)

        self.add_field("val_timer", 290, 280, FT_SMALL)

    def update_values(self, sensor_raw, timer):
        self.modify_field("val_time",
                          datetime.now(timezone(timedelta(hours=2))).strftime("%H:%M:%S"))
        self.modify_field("val_battery", "00"+ '%')
        self.modify_field("val_pressure", "000")
        self.modify_field("val_ndl", sensor_raw[5])
        self.modify_field("val_depth", f"{sensor_raw[2]:.2f}")
        self.modify_field("val_updown", up_down_from_file())
        self.modify_field("val_temp", f"{sensor_raw[0]:.2f}")
        self.modify_field("val_mod", str(sensor_raw[4]))
        self.modify_field("val_palier", sensor_raw[6])
        self.modify_field("val_timer", str(timer))

    def update(self, button):
        return None
