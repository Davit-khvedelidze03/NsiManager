import { Component, DestroyRef, OnInit, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { RoleService } from '../../../core/services/role.service';
import { AlertService } from '../../../shared/alert/alert.service';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { Sp122, Sp122Field, Sp122Request } from '../models/sp122';
import { FieldDef, SP122_FIELDS } from '../models/sp122-fields';
import { Sp122ApiService } from '../services/sp122-api.service';
import { Sp122FormService } from '../services/sp122-form.service';

import { rangeValidator, trimName, validatorsFor } from '../models/sp122-validation';

@Component({
  selector: 'app-sp122-list',
  imports: [ReactiveFormsModule],
  templateUrl: './sp122-list.html',
  styleUrl: './sp122-list.css',
})
export class Sp122List implements OnInit {
  protected readonly store = inject(Sp122FormService);
  protected readonly roles = inject(RoleService);
  private readonly api = inject(Sp122ApiService);
  private readonly alerts = inject(AlertService);
  private readonly confirm = inject(ConfirmService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly fields = SP122_FIELDS;
  protected readonly saving = signal(false);
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  protected readonly form = this.fb.group(
    Object.fromEntries(SP122_FIELDS.map((f) => [f.key, ['', validatorsFor(f)]])) as Record<
      Sp122Field,
      [string, ValidatorFn[]]
    >,
    { validators: rangeValidator },
  );

  constructor() {
    // მომხმარებლის რეჟიმში ფორმა დამალულია — მონიშვნაც და შეუნახავი ცვლილებებიც უქმდება
    effect(() => {
      if (!this.roles.isAdmin()) {
        untracked(() => this.clear());
      }
    });
  }

  ngOnInit(): void {
    this.searchControl.setValue(this.store.searchTerm(), { emitEvent: false });
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => this.store.search(term));

    const selected = this.store.selected();
    if (selected) {
      this.form.reset(toFormValue(selected));
    }
    this.store.load();
  }

  /** ხაზზე დაჭერა: ფორმაში ჩატვირთვა; იმავე ხაზზე მეორედ დაჭერა — მონიშვნის მოხსნა. */
  protected select(row: Sp122): void {
    if (!this.roles.isAdmin()) {
      return;
    }
    if (this.store.selected()?.prkey === row.prkey) {
      this.clear();
      return;
    }
    this.store.select(row);
    this.form.reset(toFormValue(row));
  }

  protected clear(): void {
    this.store.deselect();
    this.form.reset(emptyFormValue());
  }

  /** „დამატება“ (ახალი) ან „შენახვა“ (მონიშნული ჩანაწერის რედაქტირება). */
  protected save(): void {
    if (!this.roles.isAdmin() || this.saving()) {
      return;
    }
    for (const key of ['nazGr', 'nazRus'] as const) {
      this.form.controls[key].setValue(trimName(this.form.controls[key].value));
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alerts.error('შეამოწმეთ წითლად მონიშნული ველები');
      return;
    }

    const request = toRequest(this.form.getRawValue());
    const selected = this.store.selected();
    const operation = selected
      ? this.api.update(selected.prkey, request)
      : this.api.insert(request);

    this.saving.set(true);
    this.api
      .checkOverlap(request.ng!, request.vg!, selected?.prkey)
      .pipe(
        switchMap((overlap) => {
          if (overlap) this.alerts.info('დიაპაზონის განმეორებითი შეყვანა — დიაპაზონები იკვეთება');
          return operation;
        }),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (row) => {
          if (selected) {
            this.alerts.success('ცვლილება შენახულია');
            this.store.select(row);
            this.form.reset(toFormValue(row));
          } else {
            this.alerts.success('ჩანაწერი დამატებულია');
            this.clear();
          }
          this.store.load();
        },
        // შეცდომას errorInterceptor-ი უკვე აჩვენებს
        error: () => undefined,
      });
  }

  protected async remove(): Promise<void> {
    const selected = this.store.selected();
    if (!selected || !this.roles.isAdmin()) {
      return;
    }

    const confirmed = await this.confirm.ask(`წაიშალოს ჩანაწერი ${selected.ng} – ${selected.vg}?`);
    if (!confirmed) {
      return;
    }

    this.api.delete(selected.prkey).subscribe({
      next: () => {
        this.alerts.success('ჩანაწერი წაშლილია');
        this.clear();
        this.store.load();
      },
      error: () => undefined,
    });
  }

  protected isSelected(row: Sp122): boolean {
    return this.store.selected()?.prkey === row.prkey;
  }

  protected showError(key: Sp122Field): boolean {
    const control = this.form.controls[key];
    const touched = control.touched || control.dirty;
    if (control.invalid && touched) {
      return true;
    }
    return (
      touched &&
      ((key === 'vg' && this.form.hasError('range')) ||
        (key === 'utv' && this.form.hasError('utvLength')))
    );
  }

  protected errorText(field: FieldDef): string {
    const control = this.form.controls[field.key];
    if (control.hasError('required')) {
      return 'სავალდებულო ველი';
    }
    if (control.hasError('nonzero')) return 'შეიყვანეთ ნულისგან განსხვავებული რიცხვი';
    if (control.hasError('ending'))
      return field.key === 'ng'
        ? 'ქვედა ზღვარი უნდა მთავრდებოდეს 0-ით'
        : 'ზედა ზღვარი უნდა მთავრდებოდეს 9-ით';
    if (field.key === 'utv' && this.form.hasError('utvLength'))
      return 'ტიპის კოდი ამ ნომრისთვის უნდა იყოს ' + this.form.getError('utvLength') + '-ნიშნა';
    if (control.hasError('maxlength')) {
      return `მაქსიმუმ ${field.maxLength} სიმბოლო`;
    }
    if (control.hasError('pattern')) {
      switch (field.kind) {
        case 'wagon':
          return 'უნდა იყოს 8-ნიშნა რიცხვი';
        case 'decimal':
          return 'რიცხვი, მაქსიმუმ 2 ათწილადით';
        case 'numericText':
          return 'შეიყვანეთ რიცხვი';
        default:
          return 'მხოლოდ მთელი რიცხვი';
      }
    }
    if (field.key === 'vg' && this.form.hasError('range')) {
      return 'ზედა ზღვარი უნდა აღემატებოდეს ქვედას';
    }
    return '';
  }

  protected inputMode(field: FieldDef): string | null {
    switch (field.kind) {
      case 'text':
        return null;
      case 'decimal':
      case 'numericText':
        return 'decimal';
      default:
        return 'numeric';
    }
  }
}

type FormValue = Record<Sp122Field, string>;

function emptyFormValue(): FormValue {
  return Object.fromEntries(SP122_FIELDS.map((f) => [f.key, ''])) as FormValue;
}

function toFormValue(row: Sp122): FormValue {
  return Object.fromEntries(
    SP122_FIELDS.map((f) => [f.key, row[f.key]?.toString() ?? '']),
  ) as FormValue;
}

/** ფორმის ტექსტები → API-ის მოთხოვნა: ცარიელი → null, რიცხვები → number. */
function toRequest(value: FormValue): Sp122Request {
  const entries = SP122_FIELDS.map((f) => {
    const raw = value[f.key].trim();
    if (raw === '') {
      return [f.key, null];
    }
    return [
      f.key,
      f.kind === 'text' || f.kind === 'numericText' ? raw : Number(raw.replace(',', '.')),
    ];
  });
  return Object.fromEntries(entries) as Sp122Request;
}
