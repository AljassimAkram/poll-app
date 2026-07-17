import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-survery-status-component',
  imports: [],
  templateUrl: './survery-status-component.html',
  styleUrl: './survery-status-component.scss',
})
export class SurveryStatusComponent {
  @Input() color?: 'light' | 'deep';
}
