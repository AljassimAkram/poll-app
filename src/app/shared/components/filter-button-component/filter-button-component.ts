import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-filter-button-component',
  imports: [],
  templateUrl: './filter-button-component.html',
  styleUrl: './filter-button-component.scss',
})
export class FilterButtonComponent {
  @Input() isClicked?: Boolean;

  /**
   * Toggles background color state.
   * Switches between active and inactive.
   */
  changeBgColor() {
    this.isClicked = !this.isClicked;
  }
}
