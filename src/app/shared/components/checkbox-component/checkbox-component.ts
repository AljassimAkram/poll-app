import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SupabaseServieces } from '../../services/supabase-servieces';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkbox-component',
  imports: [],
  templateUrl: './checkbox-component.html',
  styleUrl: './checkbox-component.scss',
})
export class CheckboxComponent {
  @Input() answer: { text: string; id: number } = { text: '', id: 0 };
  @Input() borderColor = '#000000';
  @Input() checkedCheckbox = false;
  @Input() disabled = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  answers: any = null;

  /**
   * Creates the component.
   * Uses Supabase service and route data.
   */
  constructor(
    private supabaseService: SupabaseServieces,
    private route: ActivatedRoute,
  ) {}

  /**
   * Runs when component starts.
   * Gets id from route.
   * Loads answers from database.
   */
  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.answers = await this.supabaseService.getAnswersById(Number(id));
  }

  /**
   * Changes the checked value for an answer.
   * Toggles local state.
   * Emits the new value.
   * Updates database for matching answer.
   */
  changeValueOnDB(answer: { text: string; id: number }) {
    this.checkedCheckbox = !this.checkedCheckbox;
    this.checkedChange.emit(this.checkedCheckbox);
    this.supabaseService.updatedClickedAnswerInDB(answer.id, this.checkedCheckbox);
  }
}
