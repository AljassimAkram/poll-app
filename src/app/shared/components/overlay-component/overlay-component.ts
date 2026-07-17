import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-overlay-component',
  imports: [],
  templateUrl: './overlay-component.html',
  styleUrl: './overlay-component.scss',
})
export class OverlayComponent {
  @Input() published = false;
  @Output() close = new EventEmitter<void>();

  /**
 * Closes the popup.
 * Sends close event to parent.
 */
  closePopUp() {
    this.close.emit();
  }
}
