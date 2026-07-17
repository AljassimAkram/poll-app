import { Component, EventEmitter, Output } from '@angular/core';
import { ɵEmptyOutletComponent } from '@angular/router';
import { CategoriesService } from '../../services/categories-servieces';

@Component({
  selector: 'app-drop-down-component',
  imports: [ɵEmptyOutletComponent],
  templateUrl: './drop-down-component.html',
  styleUrl: './drop-down-component.scss',
})
export class DropDownComponent {
  sortBy = false; //false = down true = up
  display = true;
  selectedItem: string = '';
  listItems: string[] = [];
  @Output() categorySelected = new EventEmitter<number>();

  /**
   * Creates the component.
   * Uses category service.
   */
  constructor(private categoriesService: CategoriesService) {}

  /**
   * Loads categories on start.
   */
  ngOnInit() {
    this.listItems = this.categoriesService.getCategories();
  }

  /**
   * Changes sorting state.
   * Toggles display mode.
   */
  changeSortBy() {
    this.sortBy = !this.sortBy;
    this.display = !this.sortBy;
  }

  /**
   * Selects a category by id.
   * Updates selected item.
   * Sends id to parent.
   * Closes menu.
   */
  selectedCategorie(id: number) {
    this.selectedItem = this.listItems[id];
    this.categorySelected.emit(id);
    this.sortBy = !this.sortBy;
    this.display = !this.sortBy;
  }

  /**
   * Clears selected filter.
   * Sends -1 to parent.
   * Resets selected item.
   */
  deleteFilter() {
    this.categorySelected.emit(-1);
    this.selectedItem = '';
  }
}
