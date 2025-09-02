from display.template.image_template import ImageTemplate, FT_SMALL, FT_BIG

class GazScreen(ImageTemplate):
    def __init__(self):
        super().__init__()
        # Initiate Indicators
        self.add_field("ind_title", 5, 5, FT_SMALL)
        self.modify_field("ind_title", "Gaz")
        self.add_field("ind_mod", 270, 5, FT_SMALL)
        self.modify_field("ind_mod", "MOD (m):")
        self.add_field("ind_air", 100, 100, FT_BIG)
        self.modify_field("ind_air", "Air       21% O²")
        self.add_field("ind_nitrox", 100, 210, FT_BIG)
        self.modify_field("ind_nitrox", "Nitrox")


        # Initiate Values
        self.add_field("val_mod", 400, 5, FT_SMALL)

        self.add_field("val_nitrox", 260, 210, FT_BIG)