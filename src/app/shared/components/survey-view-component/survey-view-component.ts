import { Component, Input } from '@angular/core';
import { SurveryStatusComponent } from "../survery-status-component/survery-status-component";

@Component({
  selector: 'app-survey-view-component',
  imports: [SurveryStatusComponent],
  templateUrl: './survey-view-component.html',
  styleUrl: './survey-view-component.scss',
})
export class SurveyViewComponent {
  @Input() titel?: string;
  @Input() description?: string;
  @Input() dayText?: string;
}
