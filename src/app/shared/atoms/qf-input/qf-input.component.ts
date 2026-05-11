import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'qf-input',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: QfInputComponent, multi: true }],
  template: `
    <label class="field">
      <span>{{ label }}</span>
      <input [type]="type" [placeholder]="placeholder" [value]="value" [disabled]="disabled" (input)="onInput($event)" (blur)="onTouched()" />
    </label>
  `,
  styles: [`
    .field { display: grid; gap: 8px; color: var(--qf-muted); font-weight: 700; font-size: .88rem; }
    input { width: 100%; border: 1px solid var(--qf-line); border-radius: 16px; padding: 13px 14px; color: var(--qf-text); background: rgba(255,255,255,.055); outline: none; }
    input:focus { border-color: rgba(16,23,217,.75); box-shadow: 0 0 0 4px rgba(0,3,140,.22); }
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

  writeValue(value: string | null): void { this.value = value ?? ''; }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; }
  onInput(event: Event): void { this.value = (event.target as HTMLInputElement).value; this.onChange(this.value); }
}
