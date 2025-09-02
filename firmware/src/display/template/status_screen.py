from display.template.image_template import ImageTemplate, FT_SMALL, FT_BIG

class StatusScreen(ImageTemplate):
    def __init__(self):
        super().__init__()

        # Initiate Indicators
        self.add_field("ind_title", 5, 5, FT_SMALL)
        self.modify_field("ind_title", "Status")

        self.add_field("ind_battery", 100, 80, FT_SMALL)
        self.modify_field("ind_battery", "Batterie:")

        self.add_field("ind_cpress", 100, 130, FT_SMALL)
        self.modify_field("ind_cpress", "Capteur Pression:")

        self.add_field("ind_compas", 100, 180, FT_SMALL)
        self.modify_field("ind_compas", "Compas:")

        self.add_field("ind_ble", 100, 230, FT_SMALL)
        self.modify_field("ind_ble", "BLE:")

        #Initiate Values

        self.add_field("val_battery", 320, 80, FT_SMALL)

        self.add_field("val_cpress", 320, 130, FT_SMALL)

        self.add_field("val_compas", 320, 180, FT_SMALL)

        self.add_field("val_ble", 320, 230, FT_SMALL)

    def update(self):
        '''
        Need to update:
        - battery
        - cpress status
        - compas status
        - ble status
        '''

