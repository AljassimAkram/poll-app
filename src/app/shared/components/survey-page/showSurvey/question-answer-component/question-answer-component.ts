import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CheckboxComponent } from '../../../createSurveys/checkbox-component/checkbox-component';

@Component({
  selector: 'app-question-answer-component',
  imports: [CheckboxComponent],
  templateUrl: './question-answer-component.html',
  styleUrl: './question-answer-component.scss',
})
export class QuestionAnswerComponent {
  @Input() questionNumber = 1;
  @Input() questionTitle = '';
  @Input() questionMoreAnswers = true;
  @Input() questions: { text: string; id: number }[] = [];
  @Input() disabled = false;

  @Output() selectionChanged = new EventEmitter<number[]>();

  selectedAnswer: number | null = null;
  selectedAnswers: number[] = [];

  /**
   * Converts number to letter.
   * 0 becomes A, 1 becomes B, etc.
   */
  getLetterFromNumber(i: number) {
    return String.fromCharCode(65 + i);
  }

  /**
   * Selects or removes one answer locally.
   * Nothing is saved in Supabase here.
   */
  onSingleAnswerSelected(checked: boolean, answerId: number) {
    this.selectedAnswer = checked ? answerId : null;
    this.emitSingleSelection();
  }

  /**
   * Selects or removes multiple answers locally.
   * Nothing is saved in Supabase here.
   */
  onMultipleAnswerSelected(checked: boolean, answerId: number) {
    if (checked) {
      this.addMultipleAnswer(answerId);
    } else {
      this.removeMultipleAnswer(answerId);
    }

    this.selectionChanged.emit([...this.selectedAnswers]);
  }

  private emitSingleSelection() {
    const selectedIds = this.selectedAnswer !== null
      ? [this.selectedAnswer]
      : [];

    this.selectionChanged.emit(selectedIds);
  }

  private addMultipleAnswer(answerId: number) {
    if (!this.selectedAnswers.includes(answerId)) {
      this.selectedAnswers.push(answerId);
    }
  }

  private removeMultipleAnswer(answerId: number) {
    this.selectedAnswers = this.selectedAnswers.filter(
      (id) => id !== answerId
    );
  }
}