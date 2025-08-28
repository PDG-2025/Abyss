import datetime
import math
import ms5837
import time
import random

OSR = ms5837.OSR_4096

class DepthSensor:
    def __init__(self, bus, fluid_density=ms5837.DENSITY_FRESHWATER, sim=False):
        self.time = None
        self.pressure = None
        self.depth = None
        self.temperature = None
        self.simulate = sim
        if not self.simulate:
            self.sensor = ms5837.Sensor(bus, fluid_density)
            if not self.sensor.init():
                raise RuntimeError("Can't initialize DepthSensor")
        else:
            self._strat_time = time.time()
        self.status = True

    def update(self):
        if not self.simulate:
            if not self.sensor.read(OSR):
                return False
            self.time = datetime.datetime.now().isoformat()
            self.pressure = self.sensor.pressure()
            self.depth = self.sensor.depth()
            self.temperature = self.sensor.temperature()
            return True
        else:
            t = time.time() - self._start
            depth = 15 + 15 * math.sin(t / 10)
            temp = 20 + 2 * math.sin(t / 30)
            self.time = datetime.datetime.now().isoformat()
            self.pressure = random.randint(1, 10)
            self.depth = depth
            self.temperature = temp
            return True

    def getData(self):
        return self.time, self.pressure, self.depth, self.temperature







