import { OptionExtensions } from '../../../../scuba-physics/src/lib/Options.spec';
import { SafetyStop } from 'projects/scuba-physics/src/public-api';
import { SelectedWaypoint } from './selectedwaypointService';
import { inject, TestBed } from '@angular/core/testing';
import { PlannerService } from './planner.service';
import { Salinity, Segment, StandardGases } from 'scuba-physics';
import { WayPoint } from './models';
import { WorkersFactoryCommon } from './serial.workers.factory';

describe('Selected Waypoint', () => {
    const options = OptionExtensions.createOptions(0.4, 0.85, 1.4, 1.6, Salinity.fresh);
    options.safetyStop = SafetyStop.always;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [WorkersFactoryCommon, PlannerService]
        });
    });

    it('Selected assigned fires event', inject([PlannerService],
        (planner: PlannerService) => {
            const expected = WayPoint.fromSegment(new Segment(5, 10, StandardGases.air, 60));
            let received: WayPoint | undefined;

            const sut = new SelectedWaypoint(planner);
            sut.selectedChanged.subscribe((wayPoint) => {
                received = wayPoint;
            });

            sut.selected = expected;
            expect(received).toEqual(expected);
        }));

    it('Undefined assigned fires event', inject([PlannerService],
        (planner: PlannerService) => {
            let received: WayPoint | undefined;

            const sut = new SelectedWaypoint(planner);
            sut.selectedChanged.subscribe((wayPoint) => {
                received = wayPoint;
            });

            sut.selected = undefined;
            expect(received).toEqual(undefined);
        }));

    it('Select by time stamp fires event', inject([PlannerService],
        (planner: PlannerService) => {
            let received: WayPoint | undefined;

            const sut = new SelectedWaypoint(planner);
            sut.selectedChanged.subscribe((wayPoint) => {
                received = wayPoint;
            });

            planner.calculate();
            sut.selectedTimeStamp = '1/1/1970 0:8:00';
            const expected = planner.dive.wayPoints[1];
            expect(received).toEqual(expected);
        }));

    it('Selected assigned marks item as selected', inject([PlannerService],
        (planner: PlannerService) => {
            const first = WayPoint.fromSegment(new Segment(5, 10, StandardGases.air, 60));
            const second = WayPoint.fromSegment(new Segment(5, 10, StandardGases.air, 60));
            const sut = new SelectedWaypoint(planner);
            sut.selected = first;
            sut.selected = second;
            expect(first.selected).toBeFalsy();
            expect(second.selected).toBeTruthy();
        }));
});
