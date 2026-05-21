import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl, FormsModule } from '@angular/forms';

@Component({
  selector: 'qf-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label class="field">
      <span>{{ label }}</span>
      <input
          [type]="type"
          [placeholder]="placeholder"
          [(ngModel)]="value"
          [disabled]="disabled"
          [class.error]="hasError"
          (ngModelChange)="onChange($event)"
          (blur)="onTouched()" />
    </label>
  `,
  styles: [`
    .field { display: grid; gap: 8px; color: var(--qf-muted-2); font-weight: 700; font-size: .78rem; }
    .field span { font-family: "Space Mono", monospace; letter-spacing: .08em; text-transform: uppercase; }
    input { width: 100%; border: 1px solid var(--qf-line); border-radius: 6px; padding: 12px 13px; color: var(--qf-text); background: var(--qf-black-3); outline: none; }
    input:focus { border-color: var(--qf-blue); box-shadow: inset 0 -1px 0 var(--qf-violet); }
    input.error { border-color: rgba(255,74,141,.7); box-shadow: inset 0 -1px 0 rgba(255,74,141,.5); }
  `]
})
export class QfInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  value = '';
  disabled = false;
  onChange = (_: string) => {};
  onTouched = () => {};
  constructor(@Optional() @Self() public ngControl: NgControl | null) {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  get hasError(): boolean {
    return !!(this.ngControl?.invalid && this.ngControl?.touched);
  }
  writeValue(value: string | null): void { this.value = value ?? ''; }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; }
}
