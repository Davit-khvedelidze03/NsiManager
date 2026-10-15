import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  message: string;
  confirmText: string;
  resolve: (confirmed: boolean) => void;
}

/**
 * დადასტურების ფანჯარა (DictionariesManager-ის confirm-modal-ის ანალოგი).
 * გამოყენება: `if (await confirm.ask('წაიშალოს?')) { ... }`
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly request = signal<ConfirmRequest | null>(null);

  ask(message: string, confirmText = 'წაშლა'): Promise<boolean> {
    this.request()?.resolve(false);
    return new Promise((resolve) => this.request.set({ message, confirmText, resolve }));
  }

  close(confirmed: boolean): void {
    this.request()?.resolve(confirmed);
    this.request.set(null);
  }
}
