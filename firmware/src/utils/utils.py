from enum import Enum
import math, json, threading, smbus2
from datetime import datetime
from typing import List, Dict, Tuple
from PIL import ImageFont
import sensors.ms5837 as ms5837

# Global fonts
try:
    FT_BIG = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40
    )
    FT_SMALL = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 23)
except Exception as e:
    print(f"Font loading exception: {e}")
    FT_BIG = ImageFont.load_default()
    FT_SMALL = ImageFont.load_default()

# Global attributs
LOCK_JSON = threading.Lock()
FBDEV = "/dev/fb1"
LOG_FILE = "logs/mesures.json"
# Compas config
QMC5883L_BUS = 1
QMC5883L_ADDR = 0x0D
QMC5883L_REGISTER = 0x09
QMC5883L_VALUE = 0b00011101


# Global enum
class PHASE(Enum):
    SELECT_O_GAZ = (80, 60)
    SELECT_GAZ = (210, 60)
    SELECT_GAZ_PER = (320, 60)
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
    BLE_CN = "Connexion ... "
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


class EXIT_SELECTOR(Enum):
    NON = (135, 150)
    OUI = (335, 150)


# Global methode
def init_display():
    """Initialise le framebuffer pour l'affichage."""
    try:
        fb = open(FBDEV, "wb")
    except Exception as e:
        print(f"Impossible d'ouvrir {FBDEV} ({e}), mode simulation")
        return None
    return fb


def init_ms5837():
    """Initialise le capteur MS5837 (pression/température)."""
    sensor = ms5837.MS5837_30BA()
    if not sensor.init():
        print(f"Erreur: MS5837 non détecté")
        return None
    return sensor


def init_qmc5883l():
    """Initialise le compas QMC5883L"""
    try:
        bus = smbus2.SMBus(QMC5883L_BUS)
        bus.write_byte_data(QMC5883L_ADDR, QMC5883L_REGISTER, QMC5883L_VALUE)
    except Exception as e:
        print(f"Erreur ({e}): qmc5883l non détecté")
        return None
    return bus


def get_max_depth():
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return min(item["profondeur_m"] for item in data)


def log_end(dive_time):
    """Journalise la fin d’une plongée"""
    data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",  # ISO 8601
        "dive_time": dive_time,
        "max_depth": get_max_depth(),
    }
    with LOCK_JSON:
        try:
            with open(LOG_FILE, "r") as f:
                mesures = json.load(f)
        except Exception as e:
            print("Log measurement exception:", e)
            return False
        mesures.append(data)
        with open(LOG_FILE, "w") as f:
            json.dump(mesures, f, indent=2)
    return True


def up_down_from_file():
    """Calcule la vitesse verticale"""
    with LOCK_JSON:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, list) or len(data) < 2:
            return "↑ 00"
    last = data[-5:]
    times = [
        datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00")) for d in last
    ]
    profondeurs = [d["profondeur_m"] for d in last]
    delta_profondeur = profondeurs[-1] - profondeurs[0]
    delta_temps = (times[-1] - times[0]).total_seconds() / 60
    if delta_temps == 0:
        return "↑ 00"
    vitesse = delta_profondeur / delta_temps
    if vitesse > 0:
        return f"↓ {abs(int(vitesse)):02d}"
    else:
        return f"↑ {abs(int(vitesse)):02d}"


# Dive specifics methods and variables
PH2O_BAR = 0.0627  # Pression vapeur d'eau alvéolaire (bar)
FRESH_WATER_M_TO_BAR = 0.0980665  # bar par mètre d'eau douce
LN2 = math.log(2.0)
# Demi-vies (minutes) ZHL-16C
HALF_TIMES_N2 = [
    4.0,
    5.0,
    8.0,
    12.5,
    18.5,
    27.0,
    38.3,
    54.3,
    77.0,
    109.0,
    146.0,
    187.0,
    239.0,
    305.0,
    390.0,
    498.0,
]
HALF_TIMES_HE = [
    1.51,
    1.88,
    3.02,
    4.72,
    6.99,
    10.21,
    14.48,
    20.53,
    29.11,
    41.20,
    55.19,
    70.69,
    90.34,
    115.29,
    147.42,
    188.24,
]
# Coefficients ZHL-16C (a, b) pour N2
A_N2 = [
    1.1696,
    1.0000,
    0.8618,
    0.7562,
    0.6667,
    0.5933,
    0.5282,
    0.4701,
    0.4187,
    0.3798,
    0.3497,
    0.3223,
    0.2971,
    0.2737,
    0.2523,
    0.2327,
]
B_N2 = [
    0.5578,
    0.6514,
    0.7222,
    0.7825,
    0.8126,
    0.8434,
    0.8693,
    0.8910,
    0.9092,
    0.9222,
    0.9319,
    0.9403,
    0.9477,
    0.9544,
    0.9602,
    0.9653,
]
# Coefficients ZHL-16C (a, b) pour He
A_HE = [
    1.6189,
    1.3830,
    1.1919,
    1.0458,
    0.9220,
    0.8205,
    0.7305,
    0.6502,
    0.5950,
    0.5545,
    0.5333,
    0.5189,
    0.5181,
    0.5176,
    0.5172,
    0.5119,
]
B_HE = [
    0.4770,
    0.5747,
    0.6527,
    0.7223,
    0.7582,
    0.7957,
    0.8279,
    0.8553,
    0.8757,
    0.8903,
    0.8997,
    0.9073,
    0.9122,
    0.9171,
    0.9217,
    0.9267,
]


def parse_iso_timestamp(ts: str) -> float:
    """Convertit un timestamp ISO8601 (UTC 'Z') en secondes depuis epoch."""
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()


def depth_m_to_amb_bar(depth_m: float) -> float:
    """Pression ambiante (bar) en eau douce."""
    return 1.0 + depth_m * FRESH_WATER_M_TO_BAR


def amb_bar_to_depth_m(pamb: float) -> float:
    """Profondeur (m) depuis pression ambiante (bar) en eau douce."""
    return max(0.0, (pamb - 1.0) / FRESH_WATER_M_TO_BAR)


def inspired_pp(pamb: float, fraction: float) -> float:
    """Pression partielle inspirée (N2 ou He)."""
    return max(0.0, (pamb - PH2O_BAR) * fraction)


def schreiner_equation(Pt: float, Pi: float, rate: float, k: float, dt: float) -> float:
    """
    Équation de Schreiner pour mise à jour lors d'une variation linéaire de la pression inspirée.
    Pt : pression tissulaire initiale
    Pi : pression inspirée initiale
    rate : taux de variation de Pi (bar/s)
    k : constante de tissu
    dt : durée (s)
    """
    return (Pi + rate * (dt - 1.0 / k)) + (Pt - Pi - rate / k) * math.exp(-k * dt)


def update_compartments(Pn2, Phe, PiN2_0, PiHe_0, PiN2_1, PiHe_1, dt):
    """
    Met à jour les 16 compartiments en utilisant Schreiner (variation linéaire).
    """
    newN2, newHe = [], []
    rateN2 = (PiN2_1 - PiN2_0) / dt if dt > 0 else 0
    rateHe = (PiHe_1 - PiHe_0) / dt if dt > 0 else 0
    for i in range(16):
        kN2 = LN2 / (HALF_TIMES_N2[i] * 60.0)
        kHe = LN2 / (HALF_TIMES_HE[i] * 60.0)
        newN2.append(schreiner_equation(Pn2[i], PiN2_0, rateN2, kN2, dt))
        newHe.append(schreiner_equation(Phe[i], PiHe_0, rateHe, kHe, dt))
    return newN2, newHe


def composite_a_b(Pn2_t: float, Phe_t: float, idx: int) -> Tuple[float, float]:
    total = Pn2_t + Phe_t
    if total <= 1e-9:
        return A_N2[idx], B_N2[idx]
    a = (A_N2[idx] * Pn2_t + A_HE[idx] * Phe_t) / total
    b = (B_N2[idx] * Pn2_t + B_HE[idx] * Phe_t) / total
    return a, b


def ceiling_with_gf(Pn2, Phe, pamb, gf_low, gf_high) -> float:
    """Calcule le plafond courant (m) avec interpolation GF."""
    depth = amb_bar_to_depth_m(pamb)
    gf = gf_low + (gf_high - gf_low) * (1 - depth / 100.0)  # interpolation linéaire
    gf = max(0.0, min(1.0, gf))
    max_amb_needed = 0.0
    for i in range(16):
        a, b = composite_a_b(Pn2[i], Phe[i], i)
        Pt = Pn2[i] + Phe[i]
        amb_min = (Pt - a * gf) / (b * gf)
        max_amb_needed = max(max_amb_needed, amb_min)
    return amb_bar_to_depth_m(max_amb_needed)


def buehlmann_zhl16c_ndl_palier(
    profile: List[Dict],
    gaz: Dict[str, float],
    gf_low: float = 0.3,
    gf_high: float = 0.85,
    stop_interval_m: float = 3.0,
):
    """
    Calcule NDL, prochain palier et temps au palier avec ZHL-16C + GF.
    """
    fO2 = gaz.get("O2", 0.21)
    fN2 = gaz.get("N2", 0.79)
    fHe = gaz.get("He", 0.0)
    s = fO2 + fN2 + fHe
    fO2, fN2, fHe = fO2 / s, fN2 / s, fHe / s
    # Tri et conversion timestamp
    prof = sorted(profile, key=lambda x: x["timestamp"])
    for rec in prof:
        rec["t"] = parse_iso_timestamp(rec["timestamp"])
    # Init tissus à l'équilibre surface
    pamb0 = depth_m_to_amb_bar(prof[0]["profondeur_m"])
    Pn2 = [inspired_pp(pamb0, fN2) for _ in range(16)]
    Phe = [inspired_pp(pamb0, fHe) for _ in range(16)]
    # Intégration du profil
    for i in range(1, len(prof)):
        dt = prof[i]["t"] - prof[i - 1]["t"]
        if dt <= 0:
            continue
        pamb0 = depth_m_to_amb_bar(prof[i - 1]["profondeur_m"])
        pamb1 = depth_m_to_amb_bar(prof[i]["profondeur_m"])
        PiN2_0 = inspired_pp(pamb0, fN2)
        PiHe_0 = inspired_pp(pamb0, fHe)
        PiN2_1 = inspired_pp(pamb1, fN2)
        PiHe_1 = inspired_pp(pamb1, fHe)
        Pn2, Phe = update_compartments(Pn2, Phe, PiN2_0, PiHe_0, PiN2_1, PiHe_1, dt)
    # Conditions finales
    depth_now = prof[-1]["profondeur_m"]
    pamb_now = depth_m_to_amb_bar(depth_now)
    ceiling_m = ceiling_with_gf(Pn2, Phe, pamb_now, gf_low, gf_high)
    if ceiling_m <= 0.0:
        return "-", "-", "-"
    else:
        next_stop = math.ceil(ceiling_m / stop_interval_m) * stop_interval_m
        return "-", f"{next_stop:02d}", "-"


def ndl_palier_tpalier(o2):
    with LOCK_JSON:
        with open(LOG_FILE, "r") as f:
            profile = json.load(f)
    return buehlmann_zhl16c_ndl_palier(
        profile=profile,
        gaz={"O2": o2, "N2": 100 - o2, "He": 0.0},
    )


def calc_mod(f_o2, ppO2_max=1.4):
    """
    Calcule la profondeur MOD (Maximum Operating Depth) pour un mélange Nitrox.
    :param f_o2: fraction d'oxygène (ex: 0.32 pour Nitrox32)
    :param ppO2_max: PpO2 maximale tolérée (1.4 bar par défaut) (ppO2 est viable entre 0.6 et 1.6)
    :return: profondeur MOD en mètres
    """
    if f_o2 <= 0 or f_o2 > 1:
        raise ValueError("La fraction d'O2 doit être entre 0 et 1")
    mod = ((ppO2_max / f_o2) - 1) * 10
    return math.floor(mod)
