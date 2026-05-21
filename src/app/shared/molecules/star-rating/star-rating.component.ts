import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'qf-star-rating',
  standalone: true,
  template: `
    <div class="stars" [class.editable]="editable">
      @for (star of stars; track star) {
        <button type="button" [disabled]="!editable" [class.on]="star <= value" (click)="select(star)">★</button>
      }
    </div>
  `,
  styles: [`
    .stars { display: inline-flex; gap: 3px; }
    button { border: 0; background: transparent; color: #2f375c; font-size: 1.45rem; line-height: 1; padding: 0 2px; }
    button.on { color: #f5c451; }
    button:disabled { cursor: default; }
    .editable button:hover { color: #ffe08a; transform: translateY(-1px); }
  `]
})
export class StarRatingComponent {
  @Input() value = 0;
  @Input() editable = false;
  @Output() valueChange = new EventEmitter<number>();
  stars = [1, 2, 3, 4, 5];

  select(value: number): void {
    if (!this.editable) return;
    this.value = value;
    this.valueChange.emit(value);
  }
}
