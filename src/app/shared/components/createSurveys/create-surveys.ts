import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
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
  onResize() {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  onCheck(value: boolean, index: number) {
    this.questions[index].multiple_choice = value;
  }

  goHome() {
    this.goto.goToHome();
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  deleteValue(field: string) {
    const fields = this.newSurvey as Record<string, string>;
    if (field in fields) fields[field] = '';
  }

  onCategorySelected(id: number) {
    this.filter = id;
  }

  addQuestion() {
    if (this.questions.length < 10) this.questions.push(this.createEmptyQuestion());
  }

  removeSection(index: number) {
    this.questions.splice(index, 1);
  }

  getCategory() {
    const categories = this.categoriesService.getCategories();
    this.newSurvey.Category = categories[this.filter];
  }

  async publishSurvey() {
    this.getCategory();
    const error = this.getValidationError();
    if (error) return this.showResult(error);
    this.showResult('Your survey is now published');
    await this.saveToDB();
  }

  private getValidationError(): string {
    const surveyError = this.getSurveyError();
    if (surveyError) return surveyError;
    return this.getQuestionsError();
  }

  private getSurveyError(): string {
    let error = '';
    if (!this.newSurvey.SurveyName.trim()) error += 'Survey name missing. ';
    if (!this.newSurvey.Category) error += 'Category missing. ';
    if (!this.isEndDateValid()) error += 'End date must be today or in the future. ';
    return error;
  }

  private isEndDateValid(): boolean {
    const endDate = this.newSurvey.SetEndDate;
    return Boolean(endDate && endDate >= this.getToday());
  }

  private getQuestionsError(): string {
    for (let index = 0; index < this.questions.length; index++) {
      const error = this.getQuestionError(this.questions[index], index);
      if (error) return error;
    }
    return '';
  }

  private getQuestionError(question: SurveyQuestion, index: number): string {
    const prefix = `Question ${index + 1}: `;
    if (!question.question_headline.trim()) return `${prefix}Headline missing. `;
    if (this.getFilledAnswers(question).length < 2) return `${prefix}At least 2 answers required. `;
    if (question.answers.some((answer) => !answer.trim())) return `${prefix}Empty answer found. `;
    return '';
  }

  private getFilledAnswers(question: SurveyQuestion): string[] {
    return question.answers.filter((answer) => answer.trim());
  }

  private showResult(message: string) {
    this.published = true;
    this.publishedOrError = message;
    this.showOverlay();
  }

  getToday(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }

  async saveToDB() {
    const survey = await this.createSurveyRecord();
    if (!survey) return;
    await this.saveQuestions(survey.id);
    this.resetCreateSurvey();
  }

  private createSurveyRecord() {
    return this.supabaseService.createSurvey({
      headline: this.newSurvey.SurveyName,
      description: this.newSurvey.DescribingText,
      endsDay: this.newSurvey.SetEndDate,
      category: this.newSurvey.Category,
    });
  }

  private async saveQuestions(surveyId: string) {
    for (const question of this.questions) {
      await this.saveQuestion(surveyId, question);
    }
  }

  private async saveQuestion(surveyId: string, item: SurveyQuestion) {
    const question = await this.supabaseService.createQuestion({
      survey_id: surveyId,
      multiple_choice: item.multiple_choice,
      question_headline: item.question_headline,
    });
    if (question) await this.saveAnswers(surveyId, question.id, item.answers);
  }

  private async saveAnswers(surveyId: string, questionId: string, answers: string[]) {
    for (const answer of answers) {
      await this.supabaseService.createAnswer({ survey_id: surveyId, question_id: questionId, answer_text: answer });
    }
  }

  resetCreateSurvey() {
    location.reload();
  }

  showOverlay() {
    this.time = 5000;
    this.cdr.detectChanges();
    setTimeout(() => this.hideOverlay(), this.time);
  }

  private hideOverlay() {
    this.published = false;
    this.cdr.detectChanges();
  }

  onInputChange(event: { field: string; value: string }) {
    if (this.updateSurveyField(event)) return;
    if (event.field.startsWith('QuestionTitle_')) this.updateQuestionTitle(event);
    if (event.field.startsWith('Answer_')) this.updateAnswer(event);
  }

  private updateSurveyField(event: { field: string; value: string }): boolean {
    const fields = this.newSurvey as Record<string, string>;
    if (!(event.field in fields)) return false;
    fields[event.field] = event.value;
    return true;
  }

  private updateQuestionTitle(event: { field: string; value: string }) {
    const index = Number(event.field.split('_')[1]) - 1;
    this.questions[index].question_headline = event.value;
  }

  private updateAnswer(event: { field: string; value: string }) {
    const [_, question, answer] = event.field.split('_');
    const questionIndex = Number(question) - 1;
    const answerIndex = answer.charCodeAt(0) - 65;
    this.questions[questionIndex].answers[answerIndex] = event.value;
  }

  private createEmptyQuestion(): SurveyQuestion {
    return { question_headline: '', multiple_choice: false, answers: [] };
  }
}
