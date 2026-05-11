import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  messages = signal<ToastMessage[]>([]);

  show(text: string, type: ToastMessage['type'] = 'info'): void {
    const msg = { id: ++this.seq, text, type };
    this.messages.update(values => [...values, msg]);
    setTimeout(() => this.remove(msg.id), 4200);
  }

  remove(id: number): void {
    this.messages.update(values => values.filter(msg => msg.id !== id));
  }
}
