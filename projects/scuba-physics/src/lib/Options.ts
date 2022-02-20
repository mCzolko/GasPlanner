import { DepthOptions, Salinity } from './depth-converter';
import { GasOptions } from './Gases';
import { SpeedOptions } from './speeds';

// See Options for values meaning
export class OptionDefaults {
    public static readonly altitude = 0;
    public static readonly roundStopsToMinutes = false;
    public static readonly gasSwitchDuration = 1;
    public static readonly addSafetyStop = true;
    public static readonly maxEND = 30;

    public static readonly ascentSpeed6m = 3;
    public static readonly ascentSpeed50percTo6m = 6;
    public static readonly ascentSpeed50perc = 9;
    public static readonly descentSpeed = 18;

    public static readonly gfLow = 0.4;
    public static readonly gfHigh = 0.85;
    public static readonly maxPpO2 = 1.4;
    public static readonly maxDecoPpO2 = 1.6;
    public static readonly isFreshWater = false;

    public static setMediumConservatism(options: Options): void {
        options.gfLow = OptionDefaults.gfLow;
        options.gfHigh = OptionDefaults.gfHigh;
    }

    public static useRecreational(options: Options): void {
        OptionDefaults.useGeneralRecommended(options);
        options.ascentSpeed50perc = OptionDefaults.ascentSpeed50perc;
        options.ascentSpeed50percTo6m = OptionDefaults.ascentSpeed50perc;
        options.ascentSpeed6m = OptionDefaults.ascentSpeed50perc;
    }

    public static useRecommended(options: Options): void {
        OptionDefaults.useGeneralRecommended(options);
        options.ascentSpeed50perc = OptionDefaults.ascentSpeed50perc;
        options.ascentSpeed50percTo6m = OptionDefaults.ascentSpeed50percTo6m;
        options.ascentSpeed6m = OptionDefaults.ascentSpeed6m;
    }

    private static useGeneralRecommended(options: Options): void {
        options.addSafetyStop = OptionDefaults.addSafetyStop;
        options.roundStopsToMinutes = OptionDefaults.roundStopsToMinutes;
        options.gasSwitchDuration = OptionDefaults.gasSwitchDuration;
        options.descentSpeed = OptionDefaults.descentSpeed;
    }
}

export class Options implements GasOptions, DepthOptions, SpeedOptions {
    /**
     * meters above see level, 0 for see level (default)
     */
    public altitude = OptionDefaults.altitude;

    /** If true (default) deco stops are rounded up to whole minutes (I.e. longer ascent).
     *  Otherwise, length of stops is not rounded and profile generates precise stops in seconds .  */
    public roundStopsToMinutes = OptionDefaults.roundStopsToMinutes;

    /** Gas switch stop length in minutes */
    public gasSwitchDuration = OptionDefaults.gasSwitchDuration;

    /**
     * If true, adds 3 minutes to last stop in 3 meters
     */
    public addSafetyStop = OptionDefaults.addSafetyStop;

    /**
     * Maximum equivalent air narcotic depth in meters, default 30 meters
     */
    public maxEND = OptionDefaults.maxEND;

    /**
     * Usual Ascent speed of diver swim in depths below 6 meters in metres/minute, default 3 meters/minute.
     */
    public ascentSpeed6m = OptionDefaults.ascentSpeed6m;

    /**
     * Usual Ascent speed of diver swim in depths from 50% of average depth in metres/minute up to 6 meters, default 6 meters/minute.
     */
    public ascentSpeed50percTo6m = OptionDefaults.ascentSpeed50percTo6m;

    /**
     * Usual Ascent speed of diver swim in depths between 50% average depth and 6 meters in metres/minute, default 9  meters/minute.
     */
    public ascentSpeed50perc = OptionDefaults.ascentSpeed50perc;

    /**
     * Usual descent speed used by the diver in metres/minute, default 18 meters/minute.
     */
    public descentSpeed = OptionDefaults.descentSpeed;

    /**
     * Water type used to distinguish depth converter based on density, default fresh.
     */
    public salinity = Salinity.fresh;

    constructor(
        // Gradient factors in Shearwater
        // Low (45/95)
        // Med (40/85)
        // High (35/75)

        /**
         * Low gradient factor  in range 0-1 (e.g 0-100%), default 0.4
         */
        public gfLow: number = OptionDefaults.gfLow,

        /**
         * Hight gradient factor in range 0-1 (e.g 0-100%), default 0.85
         */
        public gfHigh: number = OptionDefaults.gfHigh,

        /**
         * Maximum pp02 to be used during the dive in range 0.21-1.6, default 1.4
         */
        public maxPpO2: number = OptionDefaults.maxPpO2,

        /**
         * Maximum pp02 to be used during decompression in range 0.21-1.6, default 1.6
         */
        public maxDecoPpO2: number = OptionDefaults.maxDecoPpO2,

        /**
         * Select water salinity, default false (salt water)
         */
        public isFreshWater: boolean = OptionDefaults.isFreshWater
    ) {
        this.gfLow = gfLow || OptionDefaults.gfLow;
        this.gfHigh = gfHigh || OptionDefaults.gfHigh;
        this.maxPpO2 = maxPpO2 || OptionDefaults.maxPpO2;
        this.maxDecoPpO2 = maxDecoPpO2 || OptionDefaults.maxDecoPpO2;
        this.isFreshWater = isFreshWater || OptionDefaults.isFreshWater;
    }

    public loadFrom(other: Options): void {
        this.gfLow = other.gfLow || this.gfLow;
        this.gfHigh = other.gfHigh || this.gfHigh;
        this.maxPpO2 = other.maxPpO2 || this.maxPpO2;
        this.maxDecoPpO2 = other.maxDecoPpO2 || this.maxDecoPpO2;
        this.isFreshWater = other.isFreshWater || this.isFreshWater;
        this.salinity = other.salinity || this.salinity;

        this.altitude = other.altitude || this.altitude;
        this.roundStopsToMinutes = other.roundStopsToMinutes || this.roundStopsToMinutes;
        this.gasSwitchDuration = other.gasSwitchDuration || this.gasSwitchDuration;
        this.addSafetyStop = other.addSafetyStop || this.addSafetyStop;
        this.maxEND = other.maxEND || this.maxEND;

        this.ascentSpeed6m = other.ascentSpeed6m || this.ascentSpeed6m;
        this.ascentSpeed50percTo6m = other.ascentSpeed50percTo6m || this.ascentSpeed50percTo6m;
        this.ascentSpeed50perc = other.ascentSpeed50perc || this.ascentSpeed50perc;
        this.descentSpeed = other.descentSpeed || this.descentSpeed;
    }
}
