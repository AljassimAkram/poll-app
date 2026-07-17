import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GotoServieces {
  constructor(private router: Router) {}

  /**
   * Navigates to home page.
   */
  goToHome() {
    this.router.navigate(['/']);
  }

  /**
   * Navigates to create page.
   */
  goToCreate() {
    this.router.navigate(['/create']);
  }
}
