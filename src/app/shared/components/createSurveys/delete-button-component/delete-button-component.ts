import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-delete-button-component',
  imports: [],
  templateUrl: './delete-button-component.html',
  styleUrl: './delete-button-component.scss',
})
export class DeleteButtonComponent {
  @Output() deleteClick = new EventEmitter<void>();

  onDelete(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.deleteClick.emit();
  }
}
