import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-results-component',
  imports: [DecimalPipe],
  templateUrl: './results-component.html',
  styleUrl: './results-component.scss',
})
export class ResultsComponent {
  @Input() question?: string;

  @Input() bars: { percentage: number }[] = [{ percentage: 0 }, { percentage: 0 }];

  /**
   * Converts index to letter.
   * 0 becomes A.
   * 1 becomes B.
   * And so on.
   */
  getLetterFromIndex(i: number) {
    return String.fromCharCode(65 + i);
  }
}
