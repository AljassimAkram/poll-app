import { Component, Input } from '@angular/core';
import { CheckboxComponent } from '../../../createSurveys/checkbox-component/checkbox-component';
import { SupabaseServieces } from '../../../../services/supabase-servieces';

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
  selectedAnswer: number | null = null;
  selectedAnswers: number[] = [];

  /**
   * Creates the component.
   * Uses Supabase service.
   */
  constructor(private supabaseService: SupabaseServieces) {}

  /**
   * Converts number to letter.
   * 0 becomes A, 1 becomes B, etc.
   */
  getLetterFromNumber(i: number) {
    return String.fromCharCode(65 + i);
  }

  onSingleAnswerSelected(checked: boolean, answerId: number) {
    if (!checked && this.selectedAnswer === answerId) {
      this.supabaseService.updatedClickedAnswerInDB(answerId, false);
      this.selectedAnswer = null;
    } else if (checked) {
      if (this.selectedAnswer !== null) {
        this.supabaseService.updatedClickedAnswerInDB(this.selectedAnswer, false);
      }

      this.selectedAnswer = answerId;
      this.supabaseService.updatedClickedAnswerInDB(answerId, true);
    }
  }

  /**
   * Handles single answer selection.
   * Removes previous selection in database.
   * Sets new selected answer.
   */
  onMultipleAnswerSelected(checked: boolean, answerId: number) {
    if (checked) {
      if (!this.selectedAnswers.includes(answerId)) {
        this.selectedAnswers.push(answerId);
        this.supabaseService.updatedClickedAnswerInDB(answerId, true);
      }
    } else {
      this.selectedAnswers = this.selectedAnswers.filter((id) => id !== answerId);
      this.supabaseService.updatedClickedAnswerInDB(answerId, false);
    }
  }
}
