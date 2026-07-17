import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private categories: string[] = [
    'Team Activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  /**
   * Returns all categories.
   * Gives back a list of category names.
   */
  getCategories(): string[] {
    return this.categories;
  }
}
