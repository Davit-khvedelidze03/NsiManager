import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { RoleService } from '../../services/role.service';
import { NAV_ITEMS } from '../navigation';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class Header {
  protected readonly roles = inject(RoleService);
  protected readonly navItems = NAV_ITEMS;
  protected readonly menuOpen = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** მიმდინარე ცნობარი — ჩამონათვალის ღილაკზე მისი კოდი ჩანს */
  protected readonly current = computed(() => this.navItems.find((item) => this.url().startsWith(item.path)));

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** ჩამონათვლის გარეთ დაჭერისას იხურება */
  protected onDocumentClick(event: MouseEvent): void {
    const menu = (this.host.nativeElement as HTMLElement).querySelector('.dict-select');
    if (this.menuOpen() && menu && !menu.contains(event.target as Node)) {
      this.closeMenu();
    }
  }
}
