import { Component, inject } from '@angular/core';
import { LoadingService } from './loading.service';

/** თხელი ზოლი ეკრანის თავში, სანამ სერვერთან მოთხოვნა მიმდინარეობს. */
@Component({
  selector: 'app-loading-bar',
  template: `@if (loading.isLoading()) { <div class="bar" role="progressbar" aria-label="იტვირთება"></div> }`,
  styles: `
    .bar {
      position: fixed;
      inset: 0 0 auto 0;
      height: 3px;
      z-index: 1100;
      overflow: hidden;
      background: var(--primary-soft);
    }
    .bar::after {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 35%;
      background: var(--primary);
      animation: slide 1s ease-in-out infinite;
    }
    @keyframes slide {
      from { transform: translateX(-100%); }
      to { transform: translateX(300%); }
    }
  `,
})
export class LoadingBar {
  protected readonly loading = inject(LoadingService);
}
