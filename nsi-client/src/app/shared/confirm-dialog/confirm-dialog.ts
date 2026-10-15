import { Component, inject } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  host: { '(document:keydown.escape)': 'confirm.close(false)' },
  template: `
    @if (confirm.request(); as request) {
      <div class="backdrop" (click)="confirm.close(false)">
        <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
             (click)="$event.stopPropagation()">
          <h2 id="confirm-title">დადასტურება</h2>
          <p>{{ request.message }}</p>
          <div class="actions">
            <button type="button" class="btn btn-secondary" (click)="confirm.close(false)">გაუქმება</button>
            <button type="button" class="btn btn-danger-solid" (click)="confirm.close(true)">{{ request.confirmText }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1050;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgba(17, 24, 39, 0.35);
    }
    .dialog {
      width: min(440px, 100%);
      background: var(--surface);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: 0 20px 48px rgba(17, 24, 39, 0.2);
    }
    h2 { margin: 0 0 8px; font-size: 18px; }
    p { margin: 0; color: var(--text-muted); line-height: 1.5; }
    .actions { justify-content: flex-end; margin-top: 24px; }
  `,
})
export class ConfirmDialog {
  protected readonly confirm = inject(ConfirmService);
}
