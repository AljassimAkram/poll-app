import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { HeaderComponent } from '../../home-page/header/header-component';
import { PrimaryButtonComponent } from '../../home-page/allSurveys/primary-button-component/primary-button-component';
import { GotoServieces } from '../../../services/goto-servieces';
import { QuestionAnswerComponent } from './question-answer-component/question-answer-component';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseServieces } from '../../../services/supabase-servieces';
import { ResultsComponent } from './results-component/results-component';

@Component({
  selector: 'app-show-survey',
  imports: [
    HeaderComponent,
    PrimaryButtonComponent,
    QuestionAnswerComponent,
    ResultsComponent,
  ],
  templateUrl: './show-survey.html',
  styleUrls: ['./show-survey.scss', './show-survey-responsive.scss'],
})
export class ShowSurvey {
  constructor(
    private supabaseService: SupabaseServieces,
    private goto: GotoServieces,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  survey: any = null;
  questions: any = null;
  answers: any = null;
  counters: number[] = [];
  selectedAnswersByQuestion: Record<number, number[]> = {};
  channel: any;
  responsivOpenCloseToggle = true;

  screenWidth = window.innerWidth;
  pastSurvey = false;
  shake = false;

  /**
   * Check window width
   */
  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth;
  }

  /**
   * Loads survey data on start.
   * Builds statistics and subscribes to updates.
   */
  async ngOnInit() {
    window.scrollTo(0, 0);
    const id = this.getSurveyId();
    if (!id) return this.goToHomePage();
    if (!(await this.loadSurvey(id))) return this.goToHomePage();
    await this.loadSurveyDetails(id);
    this.subscribeToAnswers();
    this.setPastSurveyState();
  }

  private getSurveyId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  private goToHomePage() {
    this.router.navigate(['/']);
  }

  private async loadSurvey(id: string): Promise<boolean> {
    this.survey = await this.supabaseService.getSurveyById(Number(id));
    return Boolean(this.survey);
  }

  private async loadSurveyDetails(id: string) {
    this.questions = await this.supabaseService.getQuestionsById(Number(id));
    this.answers = await this.supabaseService.getAnswersById(Number(id));
    this.buildCounters();
    this.cdr.detectChanges();
  }

  private subscribeToAnswers() {
    this.channel = this.supabaseService.subscribeAnswers(() => this.loadStatisticsFromDB());
  }

  private setPastSurveyState() {
    const endDay = this.survey?.endsDay;
    const completed = this.getCompletedSurveys().includes(this.getSurveyKey());
    this.pastSurvey = Boolean(endDay && endDay < this.getToday()) || completed;
    if (this.pastSurvey) this.cdr.detectChanges();
  }

  /** Returns stable completion keys stored in this browser. */
  private getCompletedSurveys(): string[] {
    return JSON.parse(localStorage.getItem('pastSurveys') || '[]');
  }

  /** Builds a key that old reused database IDs cannot match. */
  private getSurveyKey(): string {
    const version = this.survey.created_at || this.survey.headline;
    return `${this.survey.id}:${version}:${this.survey.endsDay || ''}`;
  }

  /** Returns today's date in YYYY-MM-DD format. */
  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  pastSurveyInfo() {
    if (this.pastSurvey) {
      this.shake = false;
      this.cdr.detectChanges();

      this.shake = true;
      setTimeout(() => (this.shake = false), 500);
    }
  }

  /**
   * Removes the answer sb channel
   */
  ngOnDestroy() {
    if (this.channel) {
      this.supabaseService.supabase.removeChannel(this.channel);
    }
  }

  toggle() {
    this.responsivOpenCloseToggle = !this.responsivOpenCloseToggle;
  }

  /**
   * Reloads answer statistics from database.
   */
  async loadStatisticsFromDB() {
    this.answers = await this.supabaseService.getAnswersById(this.survey.id);
    this.buildCounters();
    this.cdr.detectChanges();
  }

  /**
   * Builds counter array from answers.
   * Sums clicked values per question.
   */
  buildCounters() {
    this.counters = [];

    for (let i = 0; i < this.answers.length; i++) {
      const qId = this.answers[i].question_id;
      const clicks = Math.max(0, Number(this.answers[i].clicked) || 0);
      this.counters[qId] = (this.counters[qId] || 0) + clicks;
    }
  }

  getPercentage(answer: any): number {
    const selectedIds = this.selectedAnswersByQuestion[answer.question_id] || [];
    const previewClick = selectedIds.includes(answer.id) ? 1 : 0;
    const clicks = Math.max(0, Number(answer.clicked) || 0) + previewClick;
    const total = (this.counters[answer.question_id] || 0) + selectedIds.length;
    return total > 0 ? (clicks / total) * 100 : 0;
  }

  onSelectionChanged(questionId: number, answerIds: number[]) {
    this.selectedAnswersByQuestion[questionId] = answerIds;
  }

  /**
   * Navigates to home page.
   */
  goHome() {
    this.goto.goToHome();
  }

  /**
   * Navigates to create page.
   */
  goCreate() {
    this.goto.goToCreate();
  }

  /**
   * Calculates survey end date.
   * Returns formatted string.
   */
  getEndDate() {
    const endDay = this.survey.endsDay;
    if (!endDay) return '';
    const [year, month, day] = endDay.split('-');
    return `${day}.${month}.${year}`;
  }

  /**
   * Checks whether at least one answer has votes.
   */
  hasVotes(): boolean {
    const databaseVotes = this.answers?.some((answer: any) => Number(answer.clicked) > 0) ?? false;
    const localVotes = Object.values(this.selectedAnswersByQuestion).some((ids) => ids.length > 0);
    return databaseVotes || localVotes;
  }

  /**
   * Set local Storage,
   */
  async completeSurvey() {
    if (this.pastSurvey) return;
    await this.saveSelectedAnswers();
    this.markSurveyAsCompleted();
  }

  private async saveSelectedAnswers() {
    const answerIds = Object.values(this.selectedAnswersByQuestion).flat();
    for (const answerId of answerIds) {
      await this.supabaseService.updatedClickedAnswerInDB(answerId, true);
    }
  }

  private markSurveyAsCompleted() {
    const pastSurveys = this.getCompletedSurveys();
    const key = this.getSurveyKey();
    if (!pastSurveys.includes(key)) pastSurveys.push(key);
    localStorage.setItem('pastSurveys', JSON.stringify(pastSurveys));
    this.pastSurvey = true;
    this.cdr.detectChanges();
    setTimeout(() => this.goHome(), 1000);
  }
}
