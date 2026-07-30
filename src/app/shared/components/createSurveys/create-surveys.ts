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

type SurveyAnswer = { id: number; text: string };
type SurveyQuestion = {
  id: number;
  question_headline: string;
  multiple_choice: boolean;
  answers: SurveyAnswer[];
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
  private nextItemId = 0;
  filter = -1;
  published = false;
  publishedOrError = '';
  isPublishing = false;
  screenWidth = window.innerWidth;
  time = 5000;
  newSurvey = {
    SurveyName: '',
    DescribingText: '',
    SetEndDate: '',
    Category: '',
  };

  questions: SurveyQuestion[] = [this.createEmptyQuestion()];
  /** Creates the survey form and injects its services. */
  constructor(
    private router: Router,
    private supabaseService: SupabaseServieces,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef,
    private goto: GotoServieces,
  ) {}
  /** Stores the current viewport width. */
  @HostListener('window:resize')
  onResize(): void {
    this.screenWidth = window.innerWidth;
  }
  /** Scrolls to the page start. */
  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
  /** Updates multiple-choice for one question. */
  onCheck(value: boolean, questionId: number): void {
    const question = this.getQuestion(questionId);
    if (question) question.multiple_choice = value;
  }
  /** Opens the home page through the navigation service. */
  goHome(): void {
    this.goto.goToHome();
  }
  /** Opens the home route. */
  goToHome(): void {
    this.router.navigate(['/']);
  }
  /** Clears one general survey field. */
  deleteValue(field: string): void {
    const fields = this.newSurvey as Record<string, string>;
    if (field in fields) fields[field] = '';
  }
  /** Stores the selected category index. */
  onCategorySelected(id: number): void {
    this.filter = id;
  }
  /** Adds one question up to the limit. */
  addQuestion(): void {
    if (this.questions.length < 10) {
      this.questions.push(this.createEmptyQuestion());
    }
  }
  /** Removes exactly the selected question. */
  removeSection(questionId: number): void {
    if (this.questions.length <= 1) return;
    this.questions = this.questions.filter((item) => item.id !== questionId);
  }
  /** Adds one answer to the selected question. */
  addAnswer(questionId: number): void {
    const question = this.getQuestion(questionId);
    if (question && question.answers.length < 5) {
      question.answers.push(this.createEmptyAnswer());
    }
  }
  /** Removes exactly the selected answer. */
  removeAnswer(questionId: number, answerId: number): void {
    const question = this.getQuestion(questionId);
    if (!question || question.answers.length <= 1) return;
    question.answers = question.answers.filter((item) => item.id !== answerId);
  }
  /** Applies the selected category to the form. */
  getCategory(): void {
    const categories = this.categoriesService.getCategories();
    this.newSurvey.Category = categories[this.filter];
  }
  /** Validates and publishes the survey once. */
  async publishSurvey(): Promise<void> {
    if (this.isPublishing) return;
    this.getCategory();
    const error = this.getValidationError();
    if (error) return this.showResult(error);
    this.isPublishing = true;
    await this.saveAndRedirect();
  }
  /** Opens the saved survey or displays a short error. */
  private async saveAndRedirect(): Promise<void> {
    const surveyId = await this.saveToDB();
    if (surveyId) return this.showSuccessAndRedirect(surveyId);
    this.isPublishing = false;
    this.showResult('Publishing failed. Try again.');
  }
  /** Shows the success message before opening the survey. */
  private async showSuccessAndRedirect(surveyId: string): Promise<void> {
    this.published = true;
    this.publishedOrError = 'Your survey is now published';
    this.cdr.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await this.router.navigate(['/survey', surveyId]);
  }
  /** Returns a short message for missing required fields. */
  private getValidationError(): string {
    if (this.hasRequiredData()) return '';

    return 'Please add name, category, question and two answers.';
  }
  /** Checks required survey, question and answer values. */
  private hasRequiredData(): boolean {
    if (!this.newSurvey.SurveyName.trim() || !this.newSurvey.Category) {
      return false;
    }
    return this.questions.every((question) => {
      const hasTitle = Boolean(question.question_headline.trim());
      return hasTitle && this.getFilledAnswers(question).length >= 2;
    });
  }
  /** Returns all non-empty answers. */
  private getFilledAnswers(question: SurveyQuestion): string[] {
    return question.answers.map((answer) => answer.text).filter((answer) => answer.trim());
  }
  /** Displays an overlay message. */
  private showResult(message: string): void {
    this.published = true;
    this.publishedOrError = message;
    this.showOverlay();
  }
  /** Returns today's date as YYYY-MM-DD. */
  getToday(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }
  /** Saves the complete survey and returns its ID. */
  async saveToDB(): Promise<string | null> {
    const survey = await this.createSurveyRecord();
    if (!survey) return null;
    await this.saveQuestions(survey.id);
    return survey.id;
  }
  /** Creates the main survey database record. */
  private createSurveyRecord() {
    return this.supabaseService.createSurvey({
      headline: this.newSurvey.SurveyName,
      description: this.newSurvey.DescribingText,
      endsDay: this.newSurvey.SetEndDate || null,
      category: this.newSurvey.Category,
    });
  }
  /** Saves every survey question. */
  private async saveQuestions(surveyId: string): Promise<void> {
    for (const question of this.questions) {
      await this.saveQuestion(surveyId, question);
    }
  }
  /** Saves one question and its answers. */
  private async saveQuestion(surveyId: string, item: SurveyQuestion): Promise<void> {
    const question = await this.supabaseService.createQuestion({
      survey_id: surveyId,
      multiple_choice: item.multiple_choice,
      question_headline: item.question_headline,
    });
    if (question) await this.saveAnswers(surveyId, question.id, item.answers);
  }
  /** Saves every answer of one question. */
  private async saveAnswers(
    surveyId: string,
    questionId: string,
    answers: SurveyAnswer[],
  ): Promise<void> {
    for (const answer of answers) {
      await this.supabaseService.createAnswer({
        survey_id: surveyId,
        question_id: questionId,
        answer_text: answer.text,
      });
    }
  }
  /** Starts the timed message overlay. */
  showOverlay(): void {
    this.time = 5000;
    this.cdr.detectChanges();
    setTimeout(() => this.hideOverlay(), this.time);
  }
  /** Hides the message overlay. */
  private hideOverlay(): void {
    this.published = false;
    this.cdr.detectChanges();
  }
  /** Routes an input change to the correct data field. */
  onInputChange(event: { field: string; value: string }): void {
    if (this.updateSurveyField(event)) return;
    if (event.field.startsWith('QuestionTitle_')) {
      this.updateQuestionTitle(event);
    }
    if (event.field.startsWith('Answer_')) this.updateAnswer(event);
  }
  /** Updates one general survey field. */
  private updateSurveyField(event: { field: string; value: string }): boolean {
    const fields = this.newSurvey as Record<string, string>;
    if (!(event.field in fields)) return false;
    fields[event.field] = event.value;
    return true;
  }
  /** Updates one question title. */
  private updateQuestionTitle(event: { field: string; value: string }): void {
    const question = this.getQuestion(Number(event.field.split('_')[1]));
    if (question) question.question_headline = event.value;
  }
  /** Updates one answer value. */
  private updateAnswer(event: { field: string; value: string }): void {
    const [, questionId, answerId] = event.field.split('_');
    const question = this.getQuestion(Number(questionId));
    const answer = question?.answers.find((item) => item.id === Number(answerId));
    if (answer) answer.text = event.value;
  }
  /** Creates one empty question. */
  private createEmptyQuestion(): SurveyQuestion {
    return {
      id: this.createId(),
      question_headline: '',
      multiple_choice: false,
      answers: [this.createEmptyAnswer(), this.createEmptyAnswer()],
    };
  }
  /** Creates one empty answer. */
  private createEmptyAnswer(): SurveyAnswer {
    return { id: this.createId(), text: '' };
  }
  /** Creates a stable local item ID. */
  private createId(): number {
    return ++this.nextItemId;
  }
  
  /** Finds a question by its stable ID. */
  private getQuestion(questionId: number): SurveyQuestion | undefined {
    return this.questions.find((question) => question.id === questionId);
  }
}
