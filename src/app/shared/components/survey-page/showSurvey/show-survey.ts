import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { HeaderComponent } from '../../home-page/header/header-component';
import { PrimaryButtonComponent } from '../../home-page/allSurveys/primary-button-component/primary-button-component';
import { GotoServieces } from '../../../services/goto-servieces';
import { QuestionAnswerComponent } from './question-answer-component/question-answer-component';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseServieces } from '../../../services/supabase-servieces';
import { ResultsComponent } from './results-component/results-component';
import { SecondaryButtonComponent } from './secondary-button-component/secondary-button-component';

@Component({
  selector: 'app-show-survey',
  imports: [
    HeaderComponent,
    PrimaryButtonComponent,
    QuestionAnswerComponent,
    ResultsComponent,
    SecondaryButtonComponent,
  ],
  templateUrl: './show-survey.html',
  styleUrl: './show-survey.scss',
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
    this.setPastSurveyState(id);
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

  private setPastSurveyState(id: string) {
    const pastSurveys = JSON.parse(localStorage.getItem('pastSurveys') || '[]');
    this.pastSurvey = pastSurveys.includes(id);
    if (this.pastSurvey) this.cdr.detectChanges();
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

      if (!this.counters[qId]) {
        this.counters[qId] = 0;
      }
      this.counters[qId] += this.answers[i].clicked;
    }
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
    const [year, month, day] = endDay.split('-');
    return `${day}.${month}.${year}`;
  }

  /**
   * Checks whether at least one answer has votes.
   */
  hasVotes(): boolean {
    return this.answers?.some((answer: any) => Number(answer.clicked) > 0) ?? false;
  }

  /**
   * Set local Storage,
   */
  completeSurvey() {
    const id = this.route.snapshot.paramMap.get('id');
    let pastSurveys = JSON.parse(localStorage.getItem('pastSurveys') || '[]');
    if (!pastSurveys.includes(id)) {
      pastSurveys.push(id);
    }
    localStorage.setItem('pastSurveys', JSON.stringify(pastSurveys));
    setTimeout(() => {
      this.goHome();
    }, 1000);
  }
}
