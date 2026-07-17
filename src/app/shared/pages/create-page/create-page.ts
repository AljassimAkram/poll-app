import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { SurveryStatusComponent } from '../../components/survery-status-component/survery-status-component';
import { SecondaryButtonComponent } from '../../components/secondary-button-component/secondary-button-component';
import { PrimaryButtonComponent } from '../../components/primary-button-component/primary-button-component';
import { RouterLink, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header-component/header-component';
import { InputFieldComponent } from '../../components/input-field-component/input-field-component';
import { DeleteButtonComponent } from '../../components/delete-button-component/delete-button-component';
import { DropDownComponent } from '../../components/drop-down-component/drop-down-component';
import { HighlightCardComponent } from '../../components/highlight-card-component/highlight-card-component';
import { CreateQuestionComponent } from '../../components/create-question-component/create-question-component';
import { SupabaseServieces } from '../../services/supabase-servieces';
import { CategoriesService } from '../../services/categories-servieces';
import { OverlayComponent } from '../../components/overlay-component/overlay-component';
import { GotoServieces } from '../../services/goto-servieces';

@Component({
  selector: 'app-create-page',
  imports: [
    SurveryStatusComponent,
    SecondaryButtonComponent,
    PrimaryButtonComponent,
    RouterLink,
    HeaderComponent,
    InputFieldComponent,
    DeleteButtonComponent,
    DropDownComponent,
    HighlightCardComponent,
    CreateQuestionComponent,
    OverlayComponent,
  ],
  templateUrl: './create-page.html',
  styleUrl: './create-page.scss',
})
export class CreatePage {
  constructor(
    private router: Router,
    private supabaseService: SupabaseServieces,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef,
    private goto: GotoServieces,
  ) {}

  filter = -1;

  published = false;
  publishedOrError = '';

  newSurvey = {
    SurveyName: '',
    DescribingText: '',
    SetEndDate: '',
    Category: '',
  };

  questions: { question_headline: string; multiple_choice: boolean; answers: string[] }[] = [
    { question_headline: '', multiple_choice: false, answers: [] },
  ];

  onCheck(value: boolean, index: number) {
    this.questions[index].multiple_choice = value;
  }

  screenWidth = window.innerWidth;

  time = 5000;

  /**
   * Check window width
   */
  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth;
  }

  /**
   * Navigates to home page.
   */
  goHome() {
    this.goto.goToHome();
  }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  /**
   * Clears description text.
   */

  deleteValue(field: string) {
    if (field === 'SurveyName') {
      this.newSurvey.SurveyName = '';
    } else if (field === 'DescribingText') {
      this.newSurvey.DescribingText = '';
    } else if (field === 'SetEndDate') {
      this.newSurvey.SetEndDate = '';
    }
  }

  /**
   * Sets selected category index.
   */
  onCategorySelected(id: number) {
    this.filter = id;
  }

  /**
   * Navigates back to home page.
   */
  goToHome() {
    this.router.navigate(['/']);
  }

  /**
   * Adds a new question.
   * Limit is 10 questions.
   */
  addQuestion() {
    if (this.questions.length < 10) {
      this.questions.push({ question_headline: '', multiple_choice: false, answers: [] });
    }
  }

  /**
   * Removes a question.
   */
  removeSection(index: number) {
    this.questions.splice(index, 1);
  }

  /**
   * Sets category name from index.
   */
  getCategory() {
    const categories = this.categoriesService.getCategories();
    this.newSurvey.Category = categories[this.filter];
  }

  /**
   * Publishes survey to database.
   * Validates input first.
   * Creates survey, questions and answers.
   */
  async publishSurvey() {
    this.getCategory();

    let error = '';

    if (this.newSurvey.SurveyName != '' && this.newSurvey.Category != undefined) {
      if (!this.newSurvey.SetEndDate || this.newSurvey.SetEndDate < this.getToday()) {
        error += 'End date must be today or in the future. ';
        this.published = true;
        this.publishedOrError = error;
        this.showOverlay();
        return;
      }

      for (let i = 0; i < this.questions.length; i++) {
        if (this.questions[i].question_headline.trim() === '') {
          error += `Question ${i + 1}: Headline missing. `;
        }

        const filledAnswers = this.questions[i].answers.filter((a) => a.trim() !== '');

        if (filledAnswers.length < 2) {
          error += `Question ${i + 1}: At least 2 answers required. `;
        }

        if (this.questions[i].answers.some((a) => a.trim() === '')) {
          error += `Question ${i + 1}: Empty answer found. `;
        }

        if (error !== '') {
          this.published = true;
          this.publishedOrError = error;
          this.showOverlay();
          return;
        }
      }

      this.published = true;
      this.publishedOrError = 'Your survey is now published';
      this.showOverlay();

      this.saveToDB();
    } else {
      if (this.newSurvey.SurveyName == '') {
        error += 'Survey name missing. ';
      }

      if (this.newSurvey.Category == undefined) {
        error += 'Category missing. ';
      }

      this.published = true;
      this.publishedOrError = error;
      this.showOverlay();
    }
  }

  getToday(): string {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return `${yyyy}-${mm}-${dd}`;
  }

  async saveToDB() {
    const survey = await this.supabaseService.createSurvey({
      headline: this.newSurvey.SurveyName,
      description: this.newSurvey.DescribingText,
      endsDay: this.newSurvey.SetEndDate,
      category: this.newSurvey.Category,
    });
    for (let i = 0; i < this.questions.length; i++) {
      const question = await this.supabaseService.createQuestion({
        survey_id: survey.id,
        multiple_choice: this.questions[i].multiple_choice,
        question_headline: this.questions[i].question_headline,
      });

      for (const answer of this.questions[i].answers) {
        await this.supabaseService.createAnswer({
          survey_id: survey.id,
          question_id: question.id,
          answer_text: answer,
        });
      }
    }
    this.resetCreateSurvey();
  }

  /**
   * Reset the create survey page
   */
  resetCreateSurvey() {
    location.reload();
  }

  /**
   * Shows overlay after publishing.
   * Hides it after time seconds.
   */
  showOverlay() {
    this.time = 5000;
    this.cdr.detectChanges();
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      this.published = false;
      this.cdr.detectChanges();
    }, this.time);
  }

  /**
   * Updates form fields from child components.
   */
  onInputChange(event: { field: string; value: string }) {
    if (event.field === 'SurveyName') {
      this.newSurvey.SurveyName = event.value;
    } else if (event.field === 'DescribingText') {
      this.newSurvey.DescribingText = event.value;
    } else if (event.field === 'SetEndDate') {
      this.newSurvey.SetEndDate = event.value;
    }

    if (event.field.startsWith('QuestionTitle_')) {
      const index = Number(event.field.split('_')[1]) - 1;
      this.questions[index].question_headline = event.value;
    }

    if (event.field.startsWith('Answer_')) {
      const parts = event.field.split('_');
      const questionIndex = Number(parts[1]) - 1;
      const answerIndex = parts[2].charCodeAt(0) - 65;
      this.questions[questionIndex].answers[answerIndex] = event.value;
    }
  }
}
