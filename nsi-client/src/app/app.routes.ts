import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { NotFound } from './core/not-found/not-found';


 //ყოველი ცნობარი ცალკე იტვირთება lazy loading-ის მეშვეობით.

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'sp122' },
      {
        path: 'sp122',
        loadChildren: () => import('./domain-modules/sp122/sp122.routes').then((m) => m.SP122_ROUTES),
      },
      { path: '**', component: NotFound, title: 'გვერდი ვერ მოიძებნა' },
    ],
  },
];
