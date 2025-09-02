from display.template.image_template import ImageTemplate, FT_SMALL, FT_BIG

class PalierScreen(ImageTemplate):
    def __init__(self):
        super().__init__()
        # Initiate Indicators
        self.add_field("ind_title", 5, 5, FT_SMALL)
        self.modify_field("ind_title", "Paliers")
        self.add_field("ind_pressure", 370, 5, FT_SMALL)
        self.modify_field("ind_pressure", "BAR")

        self.add_field("ind_time_left", 75, 75, FT_BIG)
        self.modify_field("ind_time_left", "Temps restant")
        self.add_field("ind_tl_unit", 260, 165, FT_SMALL)
        self.modify_field("ind_tl_unit", "min")

        self.add_field("ind_palier", 75, 210, FT_SMALL)
        self.modify_field("ind_palier", "Palier:")

        self.add_field("ind_depth", 75, 240, FT_SMALL)
        self.modify_field("ind_depth", "Profondeur:")

        self.add_field("ind_updown", 260, 280, FT_SMALL)
        self.modify_field("ind_updown", "m/min")

        # Initiate Values
        self.add_field("val_pressure", 320, 5, FT_SMALL)
        self.add_field("val_time_left", 200, 150, FT_BIG)
        self.add_field("val_palier", 220, 210, FT_SMALL)
        self.add_field("val_depth", 220, 240, FT_SMALL)
        self.add_field("val_updown", 150, 280, FT_SMALL)