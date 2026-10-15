import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'info';

export interface Alert {
  id: number;
  type: AlertType;
  message: string;
}

/** შეტყობინებები ეკრანის მარჯვენა ზედა კუთხეში. რამდენიმე წამში თავად ქრება. */
@Injectable({ providedIn: 'root' })
export class AlertService {
  private nextId = 1;
  readonly alerts = signal<Alert[]>([]);

  success(message: string): void {
    this.show('success', message, 4000);
  }

  error(message: string): void {
    this.show('error', message, 7000);
  }

  info(message: string): void {
    this.show('info', message, 4000);
  }

  dismiss(id: number): void {
    this.alerts.update((list) => list.filter((a) => a.id !== id));
  }

  private show(type: AlertType, message: string, duration: number): void {
    const id = this.nextId++;
    this.alerts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
