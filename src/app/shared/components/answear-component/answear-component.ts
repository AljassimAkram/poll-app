import { Component } from '@angular/core';
import { CheckboxComponent } from '../checkbox-component/checkbox-component';
import { ɵEmptyOutletComponent } from "@angular/router";

@Component({
  selector: 'app-answear-component',
  imports: [CheckboxComponent, ɵEmptyOutletComponent],
  templateUrl: './answear-component.html',
  styleUrl: './answear-component.scss',
})
export class AnswearComponent {}
