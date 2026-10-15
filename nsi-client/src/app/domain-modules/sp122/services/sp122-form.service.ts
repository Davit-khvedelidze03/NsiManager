import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { Sp122 } from '../models/sp122';
import { Sp122ApiService } from './sp122-api.service';

/**
 * SP-122-ის გვერდის მდგომარეობა: ცხრილი, ძებნა, გვერდი, მონიშნული ჩანაწერი
 * (DictionariesManager-ის port-form.service-ის ანალოგი, signals-ით).
 * root-ში ცხოვრობს, ამიტომ სხვა ცნობარზე გადასვლისა და დაბრუნების შემდეგ მდგომარეობა რჩება.
 */
@Injectable({ providedIn: 'root' })
export class Sp122FormService {
  private readonly api = inject(Sp122ApiService);
  private request?: Subscription;

  readonly pageSize = 20;
  readonly rows = signal<Sp122[]>([]);
  readonly totalCount = signal(0);
  readonly page = signal(1);
  readonly searchTerm = signal('');
  readonly selected = signal<Sp122 | null>(null);
  readonly loading = signal(false);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));

  load(): void {
    this.request?.unsubscribe();
    this.loading.set(true);

    this.request = this.api
      .getList(this.searchTerm(), this.page(), this.pageSize)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          // ბოლო გვერდიდან ბოლო ჩანაწერის წაშლის შემდეგ — წინა გვერდზე გადასვლა
          if (result.items.length === 0 && result.totalCount > 0 && this.page() > 1) {
            this.page.set(Math.ceil(result.totalCount / this.pageSize));
            this.load();
            return;
          }
          this.rows.set(result.items);
          this.totalCount.set(result.totalCount);
        },
        error: () => {
          this.rows.set([]);
          this.totalCount.set(0);
        },
      });
  }

  search(term: string): void {
    this.searchTerm.set(term.trim());
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    const target = Math.min(Math.max(1, page), this.totalPages());
    if (target !== this.page()) {
      this.page.set(target);
      this.load();
    }
  }

  select(row: Sp122): void {
    this.selected.set(row);
  }

  deselect(): void {
    this.selected.set(null);
  }
}
