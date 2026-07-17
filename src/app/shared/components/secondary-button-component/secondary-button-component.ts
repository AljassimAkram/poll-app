import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-secondary-button-component',
  imports: [],
  templateUrl: './secondary-button-component.html',
  styleUrl: './secondary-button-component.scss',
})
export class SecondaryButtonComponent {
  @Input() width = 100;
}
