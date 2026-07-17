import { Routes } from '@angular/router';
import { HomePage } from './shared/pages/home-page/home-page';
import { SurveyPage } from './shared/pages/survey-page/survey-page';
import { CreatePage } from './shared/pages/create-page/create-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'survey/:id',
    component: SurveyPage,
  },
  {
    path: 'create',
    component: CreatePage,
  },

  {
    path: '**',
    redirectTo: '',
  },
];
