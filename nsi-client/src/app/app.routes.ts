import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { NotFound } from './core/not-found/not-found';

/**
 * ყოველი ცნობარი ცალკე იტვირთება (lazy loading), როგორც DictionariesManager-ში.
 * ახალი ცნობარი = ახალი ხაზი children-ში + ჩანართი core/layout/navigation.ts-ში.
 */
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
