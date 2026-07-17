import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-field-component',
  imports: [],
  templateUrl: './input-field-component.html',
  styleUrl: './input-field-component.scss',
})
export class InputFieldComponent {
  @Input() placeholder: string = '';
  @Input() fieldName: string = '';
  @Input() height = 40;
  @Input() minwidth = 100;
  @Input() maxLength = 25;
  @Input() type = 'text';
  @Input() value = '';
  @Input() textArea = false;

  @Output() valueChanged = new EventEmitter<{ field: string; value: string }>();

  get todayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Sends updated value to parent.
   * Includes field name and value.
   */
  onChange(value: string) {
    this.valueChanged.emit({ field: this.fieldName, value });
  }

  /**
   * Blocks invalid keyboard input for number fields.
   * Allows only digits and navigation keys.
   */
  onKeyDown(event: KeyboardEvent) {
    // if (this.type !== 'number') return;
    // if (
    //   event.key === 'Backspace' ||
    //   event.key === 'Delete' ||
    //   event.key === 'Tab' ||
    //   event.key.startsWith('Arrow')
    // ) {
    //   return;
    // }
    // if (!/[0-9]/.test(event.key)) {
    //   event.preventDefault();
    // }
  }

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.onChange(value);
  }
}
