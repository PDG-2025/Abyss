import time
from button.buttons import ButtonManager
from display.display_manager import DisplayManager
from sensors.sensors import SensorsManager
from utils.utils import calc_mod, log_end, ndl_palier_tpalier
def main():
    sensors_data = None
    dm = DisplayManager()
    sm = SensorsManager()
    bm = ButtonManager(dm, sm)
    dm.start()
    bm.start()
    try:
        while True:
            if dm.is_in_dive_mode():
                sensors_data = sm.get_data()
                sensors_data.append(calc_mod(dm.gaz_per))
                d1, d2, d3 = ndl_palier_tpalier(dm.gaz_per)
                sensors_data.append(d1)
                sensors_data.append(d2)
                sensors_data.append(d3)
                print("sensors data: ", sensors_data)
                dm.screen.update_values(sensors_data, dm.dive_time())
            else:
                dm.screen.update_values()
            time.sleep(0.5)
    except KeyboardInterrupt:
        try:
            log_end(dm.dive_time())
        except Exception as e:
            print(e)
        dm.stop()
        sm.stop()
        bm.stop()