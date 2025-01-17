import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PlannerService } from '../shared/planner.service';
import { WorkersFactoryCommon } from '../shared/serial.workers.factory';
import { UnitConversion } from '../shared/UnitConversion';
import { DepthsComponent } from './depths.component';

describe('DepthsComponent', () => {
    let component: DepthsComponent;
    let fixture: ComponentFixture<DepthsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DepthsComponent],
            imports: [FormsModule],
            providers: [WorkersFactoryCommon, PlannerService, UnitConversion]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DepthsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
