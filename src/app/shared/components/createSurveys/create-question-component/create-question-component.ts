import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DeleteButtonComponent } from '../delete-button-component/delete-button-component';
import { InputFieldComponent } from '../input-field-component/input-field-component';
import { CheckboxComponent } from '../checkbox-component/checkbox-component';
import { TertiaryButtonComponent } from '../tertiary-button-component/tertiary-button-component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-question-component',
  imports: [
    DeleteButtonComponent,
    InputFieldComponent,
    CheckboxComponent,
    TertiaryButtonComponent,
    FormsModule,
  ],
  templateUrl: './create-question-component.html',
  styleUrl: './create-question-component.scss',
})
export class CreateQuestionComponent {
  @Input() questionNumber = 1;
  @Output() valueChanged = new EventEmitter<{ field: string; value: string }>();
  @Output() destroy = new EventEmitter<void>();
  questions = [1, 2];
  question = {
    title: '',
    allowMultiple: false,
    answers: ['', ''],
  };

  @Output() checkboxChange = new EventEmitter<boolean>();

  /**
   * Emits destroy event.
   * Used to remove this section.
   */
  destroySection() {
    this.destroy.emit();
  }

  /**
   * Forwards changes from child component.
   * Sends event to parent.
   */
  onChildChange(event: { field: string; value: string }) {
    this.valueChanged.emit(event);
  }

  /**
   * Adds a new question index.
   * Limit is 5 questions.
   */
  addQuestion() {
    if (this.questions.length < 5) {
      this.questions.push(this.questions.length + 1);
    }
  }

  /**
   * Removes a question by index.
   * Only allows removal if index is 2 or higher.
   */
  deleteQuestion(i: number) {
    if (i >= 2) {
      this.questions.splice(i, 1);
    }
  }

  /**
   * Converts number to letter.
   * 0 becomes A, 1 becomes B, etc.
   */
  getLetterFromNumber(i: number) {
    return String.fromCharCode(65 + i);
  }
}
