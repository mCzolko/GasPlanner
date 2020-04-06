import { Tissues } from './Tissues';
import { Gases, Gas, GasOptions, GasesValidator } from './Gases';
import { Segments, Segment, SegmentsValidator } from './Segments';
import { DepthConverter } from './depth-converter';

export class Options implements GasOptions {
    private _ascentSpeed: number;

    public get ascentSpeed(): number {
        return this._ascentSpeed;
    }
    constructor(
        /**
         * Low gradient factor  in range 0-1 (e.g 0-100%), default 1
         */
        public gfLow: number,

        /**
         * Hight gradient factor in range 0-1 (e.g 0-100%), default 1
         */
        public gfHigh: number,

        /**
         * Maximum pp02 to be used during decompression in rnage 0.21-1.6, default 1.6
         */
        public maxppO2: number,

        /**
         * Maximum equivalent air narcotic depth in meters, default 30 meters
         */
        public maxEND: number,

        /**
         * Select water salinity, default false (salt water)
         */
        public isFreshWater: boolean,

        /**
         * Usual Ascent speed used by the diver in metres/minute, default 10 meters/minute.
         */
        ascentSpeed?: number
    ) {
        gfLow = gfLow || 1.0;
        gfHigh = gfHigh || 1.0;
        maxppO2 = maxppO2 || 1.6;
        maxEND = maxEND || 30;
        isFreshWater = isFreshWater || false;
        this._ascentSpeed = ascentSpeed || 10;
    }
}

/**
 * Dive definition point in moment during the dive.
 */
export class Ceiling {
    /**
     * Gets or sets moment in minutes during the dive
     */
    public time: number;

    /**
     * Gets or sets the maximum safe depth to ascent to.
     */
    public depth: number;
}

/**
 * Result of the Algorithm calculation
 */
export class CalculatedProfile {
    /**
     * Not null collection of segments filled whole dive profile.
     */
    public get segments(): Segment[] {
        return this.seg;
    }

    /**
     * Not null collection of ceilings.
     */
    public get ceilings(): Ceiling[] {
       return this.ceil;
    }

    /**
     * Not null collection of errors occurred during the profile calculation.
     * If not empty, ceilings and segments are empty.
     */
    public get errorMessages(): string[] {
        return this.errors;
    }

    private constructor(private seg: Segment[], private ceil: Ceiling[], private errors: string[]) { }

    public static fromErrors(errors: string[]) {
        return new CalculatedProfile([], [], errors);
    }

    public static fromProfile(segments: Segment[], ceilings: Ceiling[]) {
        return new CalculatedProfile(segments, ceilings, []);
    }
}

class GradientFactors {
    public gfChangePerMeter: number;

    constructor(public gfHigh: number, public gfLow: number, private fromDepth: number) {
        this.gfChangePerMeter = this.depthChangePerMeter(fromDepth);
    }

    private depthChangePerMeter(fromDepth: number): number {
        // find variance in gradient factor
        const gfDiff = this.gfHigh - this.gfLow;
        return gfDiff / fromDepth;
    }

    public gradientForDepth(depth: number): number {
        return this.gfLow + (this.gfChangePerMeter * (this.fromDepth - depth));
    }
}

class AlgorithmContext {
    public tissues = new Tissues();
    public ceilings: Ceiling[] = [];
    public runTime = 0;

    // TODO reuse tissues for repetitive dives
    constructor(public gases: Gases, public segments: Segments, public depthConverter: DepthConverter) {}

    public addCeiling(depth: number) {
        this.ceilings.push({
            time: this.runTime,
            depth: depth
        });
    }
}

export class BuhlmannAlgorithm {
    /**
     * Depth difference between two deco stops in metres.
     */
    private static readonly decoStopDistance = 3;
    private oneMinute = 1;

    public calculateDecompression(options: Options, gases: Gases, segments: Segments): CalculatedProfile {
        const depthConverter = this.selectDepthConverter(options.isFreshWater);
        const segmentMessages = SegmentsValidator.validate(segments, gases, options.maxppO2, depthConverter);
        if (segmentMessages.length > 0) {
            return CalculatedProfile.fromErrors(segmentMessages);
        }

        const last = segments.last();

        // TODO fix max depth: last doesn't have to be max. depth in multilevel diving.
        const gasMessages = GasesValidator.validate(gases, options, depthConverter, last.endDepth);
        if (gasMessages.length > 0) {
            return CalculatedProfile.fromErrors(gasMessages);
        }

        let currentDepth = last.endDepth;
        const context = new AlgorithmContext(gases, segments, depthConverter);
        const gradients = new GradientFactors(options.gfHigh, options.gfLow, currentDepth);
        this.dive(context);

        const firstDecoStop = this.firstDecoStop(context);
        let nextDecoStop = firstDecoStop;
        let nextGasSwitch = context.gases.nextGasSwitch(last.gas, currentDepth, 0, options, context.depthConverter);
        let nextStop = this.nextStop(firstDecoStop, nextGasSwitch, nextDecoStop);
        let currentGas = last.gas;

        while (nextStop >= 0) {
            // ascent to the nextStop
            const duration = (currentDepth - nextStop) / options.ascentSpeed;
            const ascent = context.segments.add(currentDepth, nextStop, currentGas, duration);
            this.swim(context, ascent);
            currentDepth = ascent.endDepth;

            if (currentDepth <= 0) {
                break;
            }

            // Deco stop
            currentGas = context.gases.bestDecoGas(currentDepth, options, depthConverter);
            nextDecoStop = this.nextDecoStop(nextStop);

            while (nextDecoStop < context.tissues.ceiling(1, depthConverter)) {
                const decoStop = context.segments.add(currentDepth, nextStop, currentGas, duration);
                this.swim(context, decoStop);
            }

            // multiple gas switches may happen before first deco stop
            nextGasSwitch = context.gases.nextGasSwitch(currentGas, currentDepth, 0, options, context.depthConverter);
            nextStop = this.nextStop(firstDecoStop, nextGasSwitch, nextDecoStop);
        }

        const merged = segments.mergeFlat();
        return CalculatedProfile.fromProfile(merged, context.ceilings);
    }

    private nextStop(firstDecoStop: number, nextGasSwitch: number, nextDecoStop: number) {
        return firstDecoStop > nextGasSwitch ? nextDecoStop : nextGasSwitch;
    }

    private nextDecoStop(lastStop: number): number {
        return lastStop - BuhlmannAlgorithm.decoStopDistance;
    }

    private firstDecoStop(context: AlgorithmContext): number {
        const ceiling = context.tissues.ceiling(1, context.depthConverter);
        const rounded = Math.round(ceiling / BuhlmannAlgorithm.decoStopDistance) * BuhlmannAlgorithm.decoStopDistance;

        const needsAdd = !!(ceiling % BuhlmannAlgorithm.decoStopDistance);
        if (needsAdd) {
            return rounded + BuhlmannAlgorithm.decoStopDistance;
        }

        return rounded;
    }

    private selectDepthConverter(isFreshWater: boolean): DepthConverter {
        if (isFreshWater) {
          return DepthConverter.forFreshWater();
        }

        return DepthConverter.forSaltWater();
    }

    public dive(context: AlgorithmContext): void {
        // TODO fix gradient factors
        const ceiling =  context.tissues.ceiling(1, context.depthConverter);
        context.addCeiling(ceiling);

        context.segments.withAll(segment => {
            this.swim(context, segment);
        });
    }

    private swim(context: AlgorithmContext, segment: Segment){
        let startDepth = segment.startDepth;

        for (let elapsed = 0; elapsed <= segment.duration; elapsed++) {
            const interval = this.calculateInterval(segment.duration, elapsed);
            const endDepth = startDepth + interval * segment.speed;
            const part = new Segment(startDepth, endDepth, segment.gas, interval);
            this.swimPart(context, part);
            startDepth = part.endDepth;
        }
    }

    private swimPart(context: AlgorithmContext, segment: Segment) {
        context.tissues.load(segment, segment.gas, context.depthConverter);
        context.runTime += segment.duration;
        const ceiling = context.tissues.ceiling(1, context.depthConverter);
        context.addCeiling(ceiling);
    }

    private calculateInterval(duration: number, elapsed: number): number {
        const remaining = duration - elapsed;

        if (remaining >= this.oneMinute) {
            return this.oneMinute;
        }

        return remaining % this.oneMinute;
    }

    public noDecoLimit(depth: number, gas: Gas, gf: number, isFreshWater: boolean): number {
        gf = gf || 1.0;
        const depthConverter = this.selectDepthConverter(isFreshWater);
        const gases = new Gases();
        gases.addBottomGas(gas);
        const segments = new Segments();
        const context = new AlgorithmContext(gases, segments, depthConverter);

        let ceiling = context.tissues.ceiling(gf, depthConverter);

        let time = 0;
        let change = 1;
        while (ceiling <= 0 && change > 0) {
            change = this.load(context, depth, gas, 1);
            ceiling = context.tissues.ceiling(gf, depthConverter);
            time++;
        }

        if (change === 0) {
            return Number.POSITIVE_INFINITY;
        }
        return time - 1; // We went one minute past a ceiling of "0"
    }

    private load(context: AlgorithmContext, depth: number, gas: Gas, time: number): number {
        return this.loadChange(context, depth, depth, gas, time);
    }

    private loadChange(context: AlgorithmContext, startDepth: number, endDepth: number, gas: Gas, time: number): number {
        const added = context.segments.add(startDepth, endDepth, gas, time);
        const loaded = context.tissues.load(added, gas, context.depthConverter);
        return loaded;
    }
}
