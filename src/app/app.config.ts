import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Remove withHashLocation() when using a real deployment server (Vercel, GitHub Pages, etc.) that supports SPA routing. For local development, hash location is used to avoid 404 errors on page refresh.
    provideRouter(routes), provideClientHydration()
  ]
};
