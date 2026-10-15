import { Component, inject } from '@angular/core';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-alerts',
  template: `
    <div class="alerts" aria-live="polite">
      @for (alert of alertService.alerts(); track alert.id) {
        <div class="alert" [class]="'alert alert-' + alert.type" role="status">
          <span class="alert-message">{{ alert.message }}</span>
          <button type="button" class="alert-close" aria-label="დახურვა" (click)="alertService.dismiss(alert.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .alerts {
      position: fixed;
      top: 84px;
      right: 24px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: min(380px, calc(100vw - 32px));
    }
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid;
      background: var(--surface);
      box-shadow: 0 8px 24px rgba(17, 24, 39, 0.1);
      font-size: 14px;
      line-height: 1.45;
    }
    .alert-success { border-color: #b7dfc4; background: #effaf2; color: #1d6b3a; }
    .alert-error { border-color: var(--danger-border); background: var(--danger-soft); color: #9b2c2c; }
    .alert-info { border-color: var(--primary-border); background: var(--primary-soft); color: #2c548f; }
    .alert-message { flex: 1; }
    .alert-close {
      border: 0;
      background: none;
      font-size: 18px;
      line-height: 1;
      color: inherit;
      cursor: pointer;
      opacity: 0.6;
    }
    .alert-close:hover { opacity: 1; }
  `,
})
export class Alerts {
  protected readonly alertService = inject(AlertService);
}
