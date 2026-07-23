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

  /**
   * Loads surveys on page start.
   * Sorts and selects top ending soon surveys.
   */
  async ngOnInit() {
    window.scrollTo(0, 0);
    this.setBodyClass('home');
    const pastSurveys: string[] = JSON.parse(localStorage.getItem('pastSurveys') || '[]');
    this.surveys = (await this.supabaseService.getSurveys()).map((s) => ({
      ...s,
      daysLeft: this.getDaysLeft(s.endsDay),
      isParticipated: pastSurveys.includes(String(s.id)),
    }));
    this.surveysEndingSoon = this.surveys
      .map((s) => ({
        ...s,
        daysLeft: this.getDaysLeft(s.endsDay),
      }))
      .filter((s) => s.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
    this.cdr.detectChanges();
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

    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDate(date: string) {
    const [y, m, d] = date.split('-');
    return `${d}.${m}.${y}`;
  }
  /**
   * Sets selected category filter.
   */
  onCategorySelected(id: number) {
    this.filter = id;
  }

  /**
   * Opens survey detail page.
   */
  openPage(id: number) {
    this.router.navigate(['/survey', id]);
  }

  /**
   * Navigates to create page.
   */
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