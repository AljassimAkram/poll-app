import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-survey-view-component',
  templateUrl: './survey-view-component.html',
  styleUrl: './survey-view-component.scss',
})
export class SurveyViewComponent {
  @Input() titel?: string;
  @Input() description?: string;
  @Input() dayText?: string;
}
