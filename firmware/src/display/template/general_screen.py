from display.template.template_screen import TemplateScreen, FT_SMALL, FT_BIG


class GeneralScreen(TemplateScreen):
    def __init__(self):
        super().__init__()
        # Initiate Indicators
        self.add_field("ind_battery", 260, 0, FT_SMALL)
        self.modify_field("ind_battery", "%")
        self.add_field("ind_pressure", 430, 0, FT_SMALL)
        self.modify_field("ind_pressure", "BAR")

        self.add_field("ind_ndl", 30, 75, FT_BIG)
        self.modify_field("ind_ndl", "NDL")
        self.add_field("ind_ndl_time", 90, 130, FT_SMALL)
        self.modify_field("ind_ndl_time", "MIN")
        self.add_field("ind_depth", 275, 110, FT_SMALL)
        self.modify_field("ind_depth", "m")
        self.add_field("ind_updown", 370, 134, FT_SMALL)
        self.modify_field("ind_updown", "m/min")

        self.add_field("ind_temp", 155, 190, FT_SMALL)
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











    def update(self):
        '''
        Need to update:
        - time
        - battery
        - pressure
        - ndl
        - depth
        - updown
        - temp
        - mod
        - palier
        - timer
        '''
        return "Not implemented yet"
