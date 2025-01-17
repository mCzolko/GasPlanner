import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { Diver } from 'scuba-physics';
import { PlannerService } from '../shared/planner.service';
import { UnitConversion } from '../shared/UnitConversion';

@Component({
    selector: 'app-app-settings',
    templateUrl: './app-settings.component.html',
    styleUrls: ['./app-settings.component.css']
})
export class AppSettingsComponent {
    public flagIcon = faFlag;
    public diver = new Diver();
    public imperialUnits = false;

    constructor(private router: Router, public units: UnitConversion, private planner: PlannerService) {
        this.imperialUnits = this.units.imperialUnits;
        this.diver.loadFrom(this.planner.diver);
    }

    public async goBack(): Promise<boolean> {
        return await this.router.navigateByUrl('/');
    }

    public use(): void {
        // TODO save settings only if form is valid
        this.planner.applyDiver(this.diver);
        this.units.imperialUnits = this.imperialUnits;
        this.applyToOptions();
        this.applyToTanks();
    }

    private applyToOptions(): void {
        const ranges = this.units.ranges;
        const options = this.planner.options;
        options.decoStopDistance = ranges.decoStopDistance;
        options.minimumAutoStopDepth = ranges.minimumAutoStopDepth;
        options.lastStopDepth = ranges.lastStopDepthDefault;
    }

    private applyToTanks(): void {
        // TODO round values of tanks
    }
}
