import RPi.GPIO as GPIO
import time

# Définition des broches utilisées
BUTTON_PINS = [5, 6, 13, 26]

def action(channel):
    """Fonction déclenchée quand un bouton est pressé"""
    if channel == 5:
        print("Bouton sur GPIO 5 appuyé → Action 1")
        # mets ton action ici
    elif channel == 6:
        print("Bouton sur GPIO 6 appuyé → Action 2")
    elif channel == 13:
        print("Bouton sur GPIO 13 appuyé → Action 3")
    elif channel == 26:
        print("Bouton sur GPIO 26 appuyé → Action 4")

# Configuration GPIO
GPIO.setmode(GPIO.BCM)  # mode BCM (numéros GPIO, pas les numéros physiques)
GPIO.setup(BUTTON_PINS, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

# Détection des événements
for pin in BUTTON_PINS:
    GPIO.add_event_detect(pin, GPIO.RISING, callback=action, bouncetime=300)

print("Appuie sur un bouton (CTRL+C pour quitter)")

try:
    while True:
        time.sleep(0.1)
except KeyboardInterrupt:
    print("Arrêt du programme")
finally:
    GPIO.cleanup()