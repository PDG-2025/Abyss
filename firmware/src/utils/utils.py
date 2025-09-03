from enum import Enum


class PHASE(Enum):
    SELECT_O_GAZ = (80,60)
    SELECT_GAZ = (210,60)
    SELECT_GAZ_PER = (280,60)
    SELECT_O_ALARME = (80, 110)
    SELECT_ALARME = (210, 110)
    SELECT_O_COMPAS = (80, 160)
    SELECT_O_BLE = (80, 210)
    START = (80, 260)

    def next(self):
        members = list(self.__class__)
        index = members.index(self)
        return members[(index + 1) % len(members)]

    def previous(self):
        members = list(self.__class__)
        index = members.index(self)
        return members[(index - 1) % len(members)]

class CONF_OPT(Enum):
    AIR = "AIR"
    NITROX = "NITROX"
    VM = "Vitesse / MOD"
    V = "Vitesse"
    M = "MOD"
    NONE = "-"
    CMP_OK = "Calibré"
    CMP_CL = "Calibration ..."
    CMP_NOT = "Non-calibré"
    BLE_OK = "Connecté"
    BLE_CN = "Tourner l'appareil"
    BLE_NOT = "Déconnecté"

    def next(self):
        members = list(self.__class__)
        index = members.index(self)
        return members[(index + 1) % len(members)]

    def previous(self):
        members = list(self.__class__)
        index = members.index(self)
        return members[(index - 1) % len(members)]

class BUTTON(Enum):
    BACK_BUTTON = 0
    UP_BUTTON = 1
    DOWN_BUTTON = 2
    ENTER_BUTTON = 3
