import { Injectable, computed, signal } from '@angular/core';

export type Role = 'Admin' | 'User';

const STORAGE_KEY = 'nsi.role';

/**
 * დროებითი (დემო) როლის გადამრთველი — ავტორიზაციის გარეშე.
 * Admin: მონაცემების მართვა; User: მხოლოდ ნახვა.
 * არჩევანი ბრაუზერში ინახება, გვერდის განახლების შემდეგაც რომ დარჩეს.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly current = signal<Role>(RoleService.restore());

  readonly role = this.current.asReadonly();
  readonly isAdmin = computed(() => this.current() === 'Admin');

  setRole(role: Role): void {
    this.current.set(role);
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // ბრაუზერის საცავი მიუწვდომელია — როლი მხოლოდ მიმდინარე სესიაში დარჩება
    }
  }

  private static restore(): Role {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'User' ? 'User' : 'Admin';
    } catch {
      return 'Admin';
    }
  }
}
