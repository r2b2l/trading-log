import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  // Redirection de la racine vers le dashboard (ou affichage direct)
  { 
    path: '', 
    component: DashboardComponent 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent 
  },
  {
    path: 'watchlist',
    loadComponent: () => import('./pages/watchlist/watchlist.component').then(m => m.WatchlistComponent),
  },
  {
    path: 'lexicon/new',
    loadComponent: () => import('./pages/lexicon-form/lexicon-form.component').then(m => m.LexiconFormComponent)
  },
  {
    path: 'lexicon',
    loadComponent: () => import('./pages/lexicon/lexicon.component').then(m => m.LexiconComponent),
  },
  {
    path: 'trades/edit/:id',
    loadComponent: () => import('./pages/trade-form/trade-form.component').then(m => m.TradeFormComponent)
  },
  {
    path: 'trades/new',
    loadComponent: () => import('./pages/trade-form/trade-form.component').then(m => m.TradeFormComponent)
  },
  {
    path: 'trades',
    loadComponent: () => import('./pages/trades-list/trades-list.component').then(m => m.TradesListComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent)
  },
  
  // Exemple pour d'autres pages futures
  // { path: 'trades', loadComponent: () => import('./pages/trades/trades.component').then(m => m.TradesComponent) },
  
  // Route par défaut / Wildcard (redirige vers l'accueil)
  { 
    path: '**', 
    redirectTo: 'dashboard', 
  }
];