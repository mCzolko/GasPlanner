import { Component } from '@angular/core';
import pkg from '../../../../../package.json';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class AppFooterComponent {
    public appVersion: string = pkg.version;
}
