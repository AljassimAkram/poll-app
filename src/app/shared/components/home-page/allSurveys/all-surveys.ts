import { Component, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { PrimaryButtonComponent } from './primary-button-component/primary-button-component';
import { HeaderComponent } from '../header/header-component';
import { HighlightCardComponent } from '../yourSurveys/highlight-card-component/highlight-card-component';
import { FilterButtonComponent } from './filter-button-component/filter-button-component';
import { DropDownComponent } from './drop-down-component/drop-down-component';
import { SurveyViewComponent } from './survey-view-component/survey-view-component';
import { SupabaseServieces } from '../../../services/supabase-servieces';
import { GotoServieces } from '../../../services/goto-servieces';

@Component({
  selector: 'app-all-surveys',
  imports: [
    HeaderComponent,
    PrimaryButtonComponent,
    HighlightCardComponent,
    FilterButtonComponent,
    DropDownComponent,
    SurveyViewComponent,
  ],
  templateUrl: './all-surveys.html',
  styleUrl: './all-surveys.scss',
})
export class AllSurveys {
  isHovered = false;
  surveys: any[] = [];
  surveysEndingSoon: any[] = [];
  filter = -1;
  activeSurveyFilter = true;
  pastSurveyFilter = false;

  constructor(
    private supabaseService: SupabaseServieces,
    private router: Router,
    private goto: GotoServieces,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
  ) {}

  async ngOnInit() {
    window.scrollTo(0, 0);
    this.setBodyClass('home');
    await this.loadSurveys();
    this.setEndingSoonSurveys();
    this.cdr.detectChanges();
  }

  private async loadSurveys() {
    const pastSurveys = this.getPastSurveys();
    const surveys = await this.supabaseService.getSurveys();
    this.surveys = surveys.map((survey) => this.prepareSurvey(survey, pastSurveys));
  }

  private getPastSurveys(): string[] {
    return JSON.parse(localStorage.getItem('pastSurveys') || '[]');
  }

  private prepareSurvey(survey: any, pastSurveys: string[]) {
    return {
      ...survey,
      daysLeft: this.getDaysLeft(survey.endsDay),
      isParticipated: pastSurveys.includes(String(survey.id)),
    };
  }

  private setEndingSoonSurveys() {
    this.surveysEndingSoon = this.surveys
      .filter((survey) => survey.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
  }

  ngOnDestroy() {
    this.removeBodyClass('home');
  }

  setBodyClass(className: string) {
    this.renderer.addClass(document.body, className);
  }

  removeBodyClass(className: string) {
    this.renderer.removeClass(document.body, className);
  }

  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('.');
    return new Date(+year, +month - 1, +day);
  }

  getDaysLeft(dateStr: string): number {
    const endDate = new Date(dateStr);
    const today = new Date();
    return Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
  }

  formatDate(date: string) {
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  }

  onCategorySelected(id: number) {
    this.filter = id;
  }

  openPage(id: number) {
    this.router.navigate(['/survey', id]);
  }

  goCreate() {
    this.goto.goToCreate();
  }

  showActiveSurvey() {
    this.activeSurveyFilter = true;
    this.pastSurveyFilter = false;
  }

  showPastSurvey() {
    this.activeSurveyFilter = false;
    this.pastSurveyFilter = true;
  }
}
