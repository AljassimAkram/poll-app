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
  @Input() questionId = 0;
  @Input() questionNumber = 1;
  @Input() canDelete = false;
  @Input() questionTitle = '';
  @Input() answers: { id: number; text: string }[] = [];
  @Input() allowMultiple = false;
  @Output() valueChanged = new EventEmitter<{ field: string; value: string }>();
  @Output() destroy = new EventEmitter<number>();
  @Output() addAnswer = new EventEmitter<number>();
  @Output() removeAnswer = new EventEmitter<{ questionId: number; answerId: number }>();
  @Output() checkboxChange = new EventEmitter<boolean>();

  /**
   * Emits destroy event.
   * Used to remove this section.
   */
  destroySection() {
    this.destroy.emit(this.questionId);
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
    this.addAnswer.emit(this.questionId);
  }

  /**
   * Removes a question by index.
   * Only allows removal if index is 2 or higher.
   */
  deleteQuestion(answerId: number) {
    this.removeAnswer.emit({ questionId: this.questionId, answerId });
  }

  /**
   * Converts number to letter.
   * 0 becomes A, 1 becomes B, etc.
   */
  getLetterFromNumber(i: number) {
    return String.fromCharCode(65 + i);
  }
}
