import { Component, Inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { HeaderComponent } from '../../components/header-component/header-component';
import { PrimaryButtonComponent } from '../../components/primary-button-component/primary-button-component';
import { SurveryStatusComponent } from '../../components/survery-status-component/survery-status-component';
import { GotoServieces } from '../../services/goto-servieces';
import { QuestionAnswerComponent } from '../../components/question-answer-component/question-answer-component';
import { AnswearComponent } from '../../components/answear-component/answear-component';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseServieces } from '../../services/supabase-servieces';
import { ResultsComponent } from '../../components/results-component/results-component';
import { DropDownComponent } from '../../components/drop-down-component/drop-down-component';
import { SecondaryButtonComponent } from '../../components/secondary-button-component/secondary-button-component';

@Component({
  selector: 'app-survey-page',
  imports: [
    HeaderComponent,
    PrimaryButtonComponent,
    SurveryStatusComponent,
    QuestionAnswerComponent,
    AnswearComponent,
    ResultsComponent,
    DropDownComponent,
    SecondaryButtonComponent,
  ],
  templateUrl: './survey-page.html',
  styleUrl: './survey-page.scss',
})
export class SurveyPage {
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
    const id = this.route.snapshot.paramMap.get('id');
    const pastSurveys: string[] = JSON.parse(localStorage.getItem('pastSurveys') || '[]');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    this.survey = await this.supabaseService.getSurveyById(Number(id));

    if (!this.survey) {
      this.router.navigate(['/']);
      return;
    }

    this.questions = await this.supabaseService.getQuestionsById(Number(id));
    this.answers = await this.supabaseService.getAnswersById(Number(id));
    this.getEndDate();
    this.buildCounters();
    this.cdr.detectChanges();

    this.channel = this.supabaseService.subscribeAnswers(() => {
      this.loadStatisticsFromDB();
    });

    if (pastSurveys.includes(id)) {
      this.pastSurvey = true;
      this.cdr.detectChanges();
    }
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
