from display.template.image_template import ImageTemplate, FT_SMALL, FT_BIG

class ConfigScreen(ImageTemplate):
    def __init__(self):
        super().__init__()
        # Initiate Indicators
        self.add_field("ind_title", 5, 5, FT_SMALL)
        self.modify_field("ind_title", "Prochaine Plongée")

        self.add_field("ind_gaz", 100, 100, FT_SMALL)
        self.modify_field("ind_gaz", "Gaz:")
        self.add_field("ind_gaz_perc", 350, 100, FT_SMALL)
        self.modify_field("ind_gaz_perc", "%")

        self.add_field("ind_alarme", 100, 150, FT_SMALL)
        self.modify_field("ind_alarme", "Alarme:")

        self.add_field("ind_compas", 100, 200, FT_SMALL)
        self.modify_field("ind_compas", "Compas:")

        # Initiate Values
        self.add_field("val_gaz", 210, 100, FT_SMALL)
        self.add_field("val_gaz_perc", 320, 100, FT_SMALL)
        self.add_field("val_alarme", 210, 150, FT_SMALL)
        self.add_field("val_compas", 210, 200, FT_SMALL)