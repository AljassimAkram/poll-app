import { Routes } from '@angular/router';
import { AllSurveys } from './shared/components/home-page/allSurveys/all-surveys';
import { ShowSurvey } from './shared/components/survey-page/showSurvey/show-survey';
import { CreateSurveys } from './shared/components/createSurveys/create-surveys';

export const routes: Routes = [
  { path: '', component: AllSurveys },
  { path: 'survey/:id', component: ShowSurvey },
  { path: 'create', component: CreateSurveys },
  { path: '**', redirectTo: '' },
];
