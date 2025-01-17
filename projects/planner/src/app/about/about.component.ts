import { Component } from '@angular/core';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Urls } from '../shared/navigation.service';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent {
    public exclamation = faExclamationTriangle;

    public get projectUrl(): string {
        return Urls.rootUrl;
    }
}
