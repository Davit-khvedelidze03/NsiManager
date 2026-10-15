import { Injectable, computed, signal } from '@angular/core';

/** მიმდინარე HTTP მოთხოვნების მთვლელი — loadingInterceptor-ი ზრდის და ამცირებს. */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pending = signal(0);
  readonly isLoading = computed(() => this.pending() > 0);

  start(): void {
    this.pending.update((n) => n + 1);
  }

  stop(): void {
    this.pending.update((n) => Math.max(0, n - 1));
  }
}
