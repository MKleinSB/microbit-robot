namespace robot {
    const I2C_ADRESS = 0x10
    const M1_INDEX = 0
    const M2_INDEX = 0x02
    const FORWARD = 0
    const BACKWARD = 1
    const PatrolLeft = 0
    const PatrolRight = 1


    function run(index: number, speed: number): void {
        const buf = pins.createBuffer(3)
        const direction = speed > 0 ? FORWARD : BACKWARD
        const s = Math.round(Math.map(Math.abs(speed), 0, 100, 0, 255))
        buf[0] = index
        buf[1] = direction
        buf[2] = s
        pins.i2cWriteBuffer(I2C_ADRESS, buf)
    }

    function readData(reg: number, len: number): Buffer {
        pins.i2cWriteNumber(I2C_ADRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadBuffer(I2C_ADRESS, len, false);
    }

    function writeData(buf: number[]): void {
        pins.i2cWriteBuffer(I2C_ADRESS, pins.createBufferFromArray(buf));
    }

    class I2CLineDetector implements drivers.LineDetectors {
        start(): void { }
        lineState(state: number[]): void {
            state[RobotLineDetector.Left] =
                readPatrol(PatrolLeft)
            state[RobotLineDetector.Right] =
                readPatrol(PatrolRight)

        }


    }
    export function readPatrol(patrol: number): number {
        let data = readData(0x1D, 1)[0];
        if (patrol == PatrolLeft) {
            return (data & 0x01) === 0 ? 0 : 1;
        } else if (patrol == PatrolRight) {
            return (data & 0x02) === 0 ? 0 : 1;
        } else {
            return data;
        }
    }

    // https://github.com/DFRobot/pxt-maqueen/blob/master/maqueen.ts
    class DFRobotMaqueenRobot extends robots.Robot {
        constructor() {
            super(0x325e1e40)
            this.lineDetectors = new I2CLineDetector()
            this.leds = new drivers.WS2812bLEDStrip(DigitalPin.P15, 4)
            this.sonar = new drivers.SR04Sonar(DigitalPin.P2, DigitalPin.P1)
        }

        motorRun(left: number, right: number): void {
            run(M1_INDEX, left)
            run(M2_INDEX, right)
        }

        headlightsSetColor(red: number, green: number, blue: number): void {
            // monochrome leds
            const on = red > 0xf || green > 0xf || blue > 0xf ? 1 : 0
            pins.digitalWritePin(DigitalPin.P8, on)
            pins.digitalWritePin(DigitalPin.P12, on)
        }

        
    }

    /**
     * DFRobot Maqueen
     */
    //% fixedInstance block="dfrobot maqueen" whenUsed weight=80
    export const dfRobotMaqueen = new RobotDriver(new DFRobotMaqueenRobot())
}