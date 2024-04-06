namespace robot {
    const I2C_ADRESS = 0x10
    const M1_INDEX = 0
    const M2_INDEX = 0x02
    const FORWARD = 0
    const BACKWARD = 1
    const PatrolLeft = 0
    const PatrolRight = 1
    const LINE_STATE_REGISTER = 0x1d

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
            const v = this.readPatrol()
            state[RobotLineDetector.Left] =
                v & 0x01 ? 0 : 1;
            state[RobotLineDetector.Right] =
                v & 0x02 ? 0 : 1;
            //            serial.writeLine(state[RobotLineDetector.Left] + " " + state[RobotLineDetector.Right])
        }
        private readPatrol() {
            let data = readData(LINE_STATE_REGISTER, 1)[0];

                return data;
            }
    }

    




    // https://github.com/DFRobot/pxt-maqueen/blob/master/maqueen.ts
    class DFRobotMaqueenRobot extends robots.Robot {
        constructor() {
            super(0x325e1e40)
            this.lineDetectors = new I2CLineDetector()
            //this.leds = new drivers.WS2812bLEDStrip(DigitalPin.P15, 4)
            this.sonar = new drivers.SR04Sonar(DigitalPin.P2, DigitalPin.P1)
        }

        motorRun(left: number, right: number): void {
            run(M1_INDEX, left)
            run(M2_INDEX, right)
        }

        headlightsSetColor(r: number, g: number, b: number) {
            writeData([0x18, r]);
            writeData([0x19, g]);
            writeData([0x1A, b]);
        }
        //        lineState() {
        //            const data = robots.i2cReadRegU8(I2C_ADRESS, LINE_STATE_REGISTER)
        //            const left = (data & 0x01) == 0x01 ? 1 : 0
        //            const right = (data & 0x02) == 0x02 ? 1 : 0
        //            return (left << 0) | (right << 1)
        //        }


    }

    /**
     * DFRobot Maqueen
     */
    //% fixedInstance block="dfrobot maqueen" whenUsed weight=80
    export const dfRobotMaqueen = new RobotDriver(new DFRobotMaqueenRobot())
}