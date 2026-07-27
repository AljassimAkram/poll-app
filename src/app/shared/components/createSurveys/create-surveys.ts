import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SecondaryButtonComponent } from '../survey-page/showSurvey/secondary-button-component/secondary-button-component';
import { PrimaryButtonComponent } from '../home-page/allSurveys/primary-button-component/primary-button-component';
import { HeaderComponent } from '../home-page/header/header-component';
import { InputFieldComponent } from './input-field-component/input-field-component';
import { DeleteButtonComponent } from './delete-button-component/delete-button-component';
import { DropDownComponent } from '../home-page/allSurveys/drop-down-component/drop-down-component';
import { CreateQuestionComponent } from './create-question-component/create-question-component';
import { SupabaseServieces } from '../../services/supabase-servieces';
import { CategoriesService } from '../../services/categories-servieces';
import { OverlayComponent } from './overlay-component/overlay-component';
import { GotoServieces } from '../../services/goto-servieces';

type SurveyQuestion = {
  question_headline: string;
  multiple_choice: boolean;
  answers: string[];
};

@Component({
  selector: 'app-create-surveys',
  imports: [
    SecondaryButtonComponent,
    PrimaryButtonComponent,
    HeaderComponent,
    InputFieldComponent,
    DeleteButtonComponent,
    DropDownComponent,
    CreateQuestionComponent,
    OverlayComponent,
  ],
  templateUrl: './create-surveys.html',
  styleUrl: './create-surveys.scss',
})
export class CreateSurveys {
  filter = -1;
  published = false;
  publishedOrError = '';
  screenWidth = window.innerWidth;
  time = 5000;

  newSurvey = {
    SurveyName: '',
    DescribingText: '',
    SetEndDate: '',
    Category: '',
  };

  questions: SurveyQuestion[] = [this.createEmptyQuestion()];

  constructor(
    private router: Router,
    private supabaseService: SupabaseServieces,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef,
    private goto: GotoServieces,
  ) {}

  @HostListener('window:resize')
  onResize(): void {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  /**
   * Updates the multiple-choice setting of a question.
   * @param value Indicates whether multiple answers are allowed.
   */
  onCheck(value: boolean, index: number): void {
    this.questions[index].multiple_choice = value;
  }

  goHome(): void {
    this.goto.goToHome();
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Clears a value from the survey form.
   * @param field Name of the survey field that should be cleared.
   */
  deleteValue(field: string): void {
    const fields = this.newSurvey as Record<string, string>;
    if (field in fields) fields[field] = '';
  }

  /**
   * Saves the selected category index.
   * @param id Index of the selected category.
   */
  onCategorySelected(id: number): void {
    this.filter = id;
  }

  addQuestion(): void {
    if (this.questions.length < 10) {
      this.questions.push(this.createEmptyQuestion());
    }
  }

  /**
   * Removes a question from the survey.
   * @param index Index of the question that should be removed.
   */
  removeSection(index: number): void {
    this.questions.splice(index, 1);
  }

  getCategory(): void {
    const categories = this.categoriesService.getCategories();
    this.newSurvey.Category = categories[this.filter];
  }

  /**
   * If validation succeeds, the survey is saved in the database.
   */
  async publishSurvey(): Promise<void> {
    this.getCategory();
    const error = this.getValidationError();
    if (error) {
      this.showResult(error);
      return;
    }
    this.showResult('Your survey is now published');
    await this.saveToDB();
  }

  /**
   * Checks the complete survey form for validation errors.
   * @returns The first validation error or an empty string.
   */
  private getValidationError(): string {
    const surveyError = this.getSurveyError();
    if (surveyError) {
      return surveyError;
    }
    return this.getQuestionsError();
  }

  /**
   * Validates the general survey information.
   * @returns A combined error message or an empty string.
   */
  private getSurveyError(): string {
    let error = '';
    if (!this.newSurvey.SurveyName.trim()) {
      error += 'Survey name missing. ';
    }
    if (!this.newSurvey.Category) {
      error += 'Category missing. ';
    }
    if (!this.isEndDateValid()) {
      error += 'End date must be today or in the future. ';
    }
    return error;
  }

  /**
   * Checks whether the end date exists and is not in the past.
   * @returns True when the end date is valid.
   */
  private isEndDateValid(): boolean {
    const endDate = this.newSurvey.SetEndDate;
    return Boolean(endDate && endDate >= this.getToday());
  }

  /**
   * Validates every question in the survey.
   * @returns The first question error or an empty string.
   */
  private getQuestionsError(): string {
    for (let index = 0; index < this.questions.length; index++) {
      const error = this.getQuestionError(this.questions[index], index);
      if (error) {
        return error;
      }
    }
    return '';
  }

  /**
   * Validates a single survey question.
   * @param question Question that should be validated.
   */
  private getQuestionError(
    question: SurveyQuestion,
    index: number,
  ): string {
    const prefix = `Question ${index + 1}: `;
    if (!question.question_headline.trim()) {
      return `${prefix}Headline missing. `;
    }
    if (this.getFilledAnswers(question).length < 2) {
      return `${prefix}At least 2 answers required. `;
    }
    if (question.answers.some((answer) => !answer.trim())) {
      return `${prefix}Empty answer found. `;
    }
    return '';
  }

  /**
   * Returns all non-empty answers of a question.
   * @param question Question containing the answers.
   */
  private getFilledAnswers(question: SurveyQuestion): string[] {
    return question.answers.filter((answer) => answer.trim());
  }

  /**
   * Displays a success or validation message in the overlay.
   * @param message Message that should be displayed.
   */
  private showResult(message: string): void {
    this.published = true;
    this.publishedOrError = message;
    this.showOverlay();
  }

  /**
   * Returns today's date in YYYY-MM-DD format.
   * @returns Today's date as a formatted string.
   */
  getToday(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }

  /**
   * Saves the survey, questions and answers in the database.
   */
  async saveToDB(): Promise<void> {
    const survey = await this.createSurveyRecord();
    if (!survey) {
      return;
    }
    await this.saveQuestions(survey.id);
    this.resetCreateSurvey();
  }

  /**
   * Creates the main survey record in the database.
   * @returns The created survey record.
   */
  private createSurveyRecord() {
    return this.supabaseService.createSurvey({
      headline: this.newSurvey.SurveyName,
      description: this.newSurvey.DescribingText,
      endsDay: this.newSurvey.SetEndDate,
      category: this.newSurvey.Category,
    });
  }

  /**
   * Saves all survey questions in the database.
   * @param surveyId ID of the created survey.
   */
  private async saveQuestions(surveyId: string): Promise<void> {
    for (const question of this.questions) {
      await this.saveQuestion(surveyId, question);
    }
  }

  /**
   * Saves a single question and its answers.
   * @param surveyId ID of the related survey.
   */
  private async saveQuestion(
    surveyId: string,
    item: SurveyQuestion,
  ): Promise<void> {
    const question = await this.supabaseService.createQuestion({
      survey_id: surveyId,
      multiple_choice: item.multiple_choice,
      question_headline: item.question_headline,
    });
    if (question) {
      await this.saveAnswers(surveyId, question.id, item.answers);
    }
  }

  /**
   * Saves all answers belonging to a question.
   * @param surveyId ID of the related survey.
   */
  private async saveAnswers(
    surveyId: string,
    questionId: string,
    answers: string[],
  ): Promise<void> {
    for (const answer of answers) {
      await this.supabaseService.createAnswer({
        survey_id: surveyId,
        question_id: questionId,
        answer_text: answer,
      });
    }
  }

  resetCreateSurvey(): void {
    location.reload();
  }

  showOverlay(): void {
    this.time = 5000;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.hideOverlay();
    }, this.time);
  }

  private hideOverlay(): void {
    this.published = false;
    this.cdr.detectChanges();
  }

  /**
   * Processes value changes emitted by the input components.
   * @param event Object containing the field name and new value.
   */
  onInputChange(event: { field: string; value: string }): void {
    if (this.updateSurveyField(event)) {
      return;
    }
    if (event.field.startsWith('QuestionTitle_')) {
      this.updateQuestionTitle(event);
    }
    if (event.field.startsWith('Answer_')) {
      this.updateAnswer(event);
    }
  }

  /**
   * Updates a general survey field.
   * @param event Object containing the field name and new value.
   */
  private updateSurveyField(
    event: { field: string; value: string },
  ): boolean {
    const fields = this.newSurvey as Record<string, string>;
    if (!(event.field in fields)) {
      return false;
    }
    fields[event.field] = event.value;
    return true;
  }

  /**
   * Updates the headline of a specific question.
   * @param event Object containing the field name and new value.
   */
  private updateQuestionTitle(
    event: { field: string; value: string },
  ): void {
    const index = Number(event.field.split('_')[1]) - 1;
    this.questions[index].question_headline = event.value;
  }

  /**
   * Updates a specific answer of a question.
   * @param event Object containing the field name and new value.
   */
  private updateAnswer(
    event: { field: string; value: string },
  ): void {
    const [, question, answer] = event.field.split('_');
    const questionIndex = Number(question) - 1;
    const answerIndex = answer.charCodeAt(0) - 65;
    this.questions[questionIndex].answers[answerIndex] = event.value;
  }

  private createEmptyQuestion(): SurveyQuestion {
    return {
      question_headline: '',
      multiple_choice: false,
      answers: [],
    };
  }
}