import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-highlight-card-component',
  templateUrl: './highlight-card-component.html',
  styleUrl: './highlight-card-component.scss',
})
export class HighlightCardComponent {
  @Input() titel?: string;
  @Input() description?: string;
  @Input() dayText?: string;

}
