import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="page">
      <h1 class="page-title">გვერდი ვერ მოიძებნა</h1>
      <p class="page-subtitle"><a routerLink="/">მთავარ გვერდზე დაბრუნება</a></p>
    </section>
  `,
})
export class NotFound {}
