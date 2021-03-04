import { Component } from '@angular/core';
import { PlannerService } from '../shared/planner.service';
import { Dive } from '../shared/models';
import { faExclamationCircle, faExclamationTriangle, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { EventType, Event, Time, Tank } from 'scuba-physics';

@Component({
    selector: 'app-consumption',
    templateUrl: './consumption.component.html',
    styleUrls: ['./consumption.component.css']
})
export class ConsumptionComponent {
    public dive: Dive;
    public exclamation = faExclamationCircle;
    public warning = faExclamationTriangle;
    public icon = faSlidersH;

    constructor(private planer: PlannerService) {
        this.dive = this.planer.dive;
    }

    public get tanks(): Tank[] {
        return this.planer.tanks;
    }

    public get needsReturn(): boolean {
        return this.planer.plan.needsReturn;
    }

    public get gasMod(): number {
        return this.planer.gasMod;
    }

    public get noDeco(): number {
        return this.planer.plan.noDecoTime;
    }

    public get descentDuration(): number {
        const diveDescent = Time.toMinutes(this.dive.descent.duration);
        return Math.ceil(diveDescent);
    }

    public isHighPpO2(event: Event): boolean {
        return event.type === EventType.highPpO2;
    }
}