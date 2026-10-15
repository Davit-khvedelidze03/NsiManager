import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Alerts } from '../../shared/alert/alerts';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { LoadingBar } from '../../shared/loading/loading-bar';
import { Header } from './header/header';

/** გვერდის ჩარჩო: header + ცნობარის გვერდი + ალერტები + დადასტურების ფანჯარა. */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Header, Alerts, ConfirmDialog, LoadingBar],
  template: `
    <app-loading-bar />
    <app-header />
    <main>
      <router-outlet />
    </main>
    <app-alerts />
    <app-confirm-dialog />
  `,
})
export class Layout {}
