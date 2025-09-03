from time import sleep
from display.screens.template_screen import TemplateScreen, FT_SMALL, FT_BIG
from enum import Enum
from utils.utils import PHASE, CONF_OPT, BUTTON



class ConfigScreen(TemplateScreen):
    def __init__(self):
        super().__init__()
        self.phase = PHASE.SELECT_O_GAZ
        self.gaz = CONF_OPT.AIR
        self.gaz_p = 21
        self.alarm = CONF_OPT.VM
        self.compas = CONF_OPT.CMP_NOT
        self.ble = CONF_OPT.BLE_NOT

        # Initiate Indicators
        self.add_field("ind_title", 5, 5, FT_SMALL)
        self.modify_field("ind_title", "Paramètres")

        self.add_field("ind_gaz", 100, 60, FT_SMALL)
        self.modify_field("ind_gaz", "Gaz:")

        self.add_field("ind_alarme", 100, 110, FT_SMALL)
        self.modify_field("ind_alarme", "Alarme:")

        self.add_field("ind_compas", 100, 160, FT_SMALL)
        self.modify_field("ind_compas", "Compas:")

        self.add_field("ind_ble", 100, 210, FT_SMALL)
        self.modify_field("ind_ble", "BLE:")

        self.add_field("ind_start", 100, 260, FT_SMALL)
        self.modify_field("ind_start", "Commencer la plongée")

        # Initiate Values
        self.add_field("val_gaz", 230, 60, FT_SMALL)
        self.modify_field("val_gaz", self.gaz.value)
        self.add_field("val_gaz_perc", 340, 60, FT_SMALL)
        self.modify_field("val_gaz_perc", str(self.gaz_p)+'%')
        self.add_field("val_alarme", 230, 110, FT_SMALL)
        self.modify_field("val_alarme", self.alarm.value)
        self.add_field("val_compas", 230, 160, FT_SMALL)
        self.modify_field("val_compas", self.compas.value)
        self.add_field("val_ble", 230, 210, FT_SMALL)
        self.modify_field("val_ble", self.ble.value)

        # Initiate Selector
        self.add_field("selector", 0, 0, FT_SMALL)
        self.modifiy_x_y("selector", self.phase.value)
        self.modify_field("selector", '➡️')

    def up_phase(self):
        if self.phase == PHASE.SELECT_O_ALARME:
            self.phase = PHASE.SELECT_O_GAZ
        elif self.phase == PHASE.SELECT_O_COMPAS:
            self.phase = PHASE.SELECT_O_ALARME
        else:
            self.phase = self.phase.previous()

    def down_phase(self):
        if self.phase == PHASE.SELECT_O_ALARME:
            self.phase = PHASE.SELECT_O_COMPAS
        elif self.phase == PHASE.SELECT_O_GAZ:
            self.phase = PHASE.SELECT_O_ALARME
        else:
            self.phase = self.phase.next()

    def set_gaz(self):
        if self.gaz == CONF_OPT.AIR:
            self.gaz = CONF_OPT.NITROX
        else:
            self.gaz = CONF_OPT.AIR
            self.gaz_p = 21

    def up_gaz(self):
        self.gaz_p = (self.gaz_p + 1) % 100

    def down_gaz(self):
        self.gaz_p = (self.gaz_p - 1) % 100

    def up_alarm(self):
        if self.alarm == CONF_OPT.VM:
            self.alarm = CONF_OPT.NONE
        else:
            self.alarm = self.alarm.previous()

    def down_alarm(self):
        if self.alarm == CONF_OPT.NONE:
            self.alarm = CONF_OPT.VM
        else:
            self.alarm = self.alarm.next()

    def update_info(self):
        self.modify_field("val_gaz", self.gaz.value)
        self.modify_field("val_gaz_perc", str(self.gaz_p)+'%')
        self.modify_field("val_alarme", self.alarm.value)
        self.modify_field("val_compas", self.compas.value)
        self.modify_field("val_ble", self.ble.value)
        self.modifiy_x_y("selector", self.phase.value)

    def update(self, button):
        match button:
            case BUTTON.BACK_BUTTON:
                if (self.phase is PHASE.SELECT_GAZ_PER or
                    self.phase is PHASE.SELECT_ALARME or
                    self.phase is PHASE.SELECT_GAZ
                ):
                    self.phase = self.phase.previous()

            case BUTTON.UP_BUTTON:
                match self.phase:
                    case (
                        PHASE.SELECT_O_GAZ |
                        PHASE.SELECT_O_ALARME |
                        PHASE.SELECT_O_COMPAS |
                        PHASE.SELECT_O_BLE |
                        PHASE.START
                    ):
                        self.up_phase()
                    case PHASE.SELECT_GAZ:
                        self.set_gaz()
                    case PHASE.SELECT_GAZ_PER:
                        if self.gaz == CONF_OPT.NITROX:
                            self.up_gaz()
                    case PHASE.SELECT_ALARME:
                        self.up_alarm()
            case BUTTON.DOWN_BUTTON:
                match self.phase:
                    case (
                    PHASE.SELECT_O_GAZ |
                    PHASE.SELECT_O_ALARME |
                    PHASE.SELECT_O_COMPAS |
                    PHASE.SELECT_O_BLE |
                    PHASE.START
                    ):
                        self.down_phase()
                    case PHASE.SELECT_GAZ:
                        self.set_gaz()
                    case PHASE.SELECT_GAZ_PER:
                        if self.gaz == CONF_OPT.NITROX:
                            self.down_gaz()
                    case PHASE.SELECT_ALARME:
                        self.down_alarm()

            case BUTTON.ENTER_BUTTON:
                match self.phase:
                    case (
                        PHASE.SELECT_O_GAZ |
                        PHASE.SELECT_GAZ_PER |
                        PHASE.SELECT_ALARME |
                        PHASE.SELECT_O_ALARME
                    ):
                        self.phase = self.phase.next()
                    case PHASE.SELECT_GAZ:
                        self.phase = self.phase.next()
                        if self.gaz == CONF_OPT.AIR:
                            self.phase = self.phase.next()
                    case PHASE.SELECT_O_COMPAS:
                        self.compas = CONF_OPT.CMP_CL
                        return CONF_OPT.CMP_CL
                    case PHASE.SELECT_O_BLE:
                        self.ble = CONF_OPT.BLE_CN
                        return CONF_OPT.BLE_CN
                    case PHASE.START:
                        return True
        return False











