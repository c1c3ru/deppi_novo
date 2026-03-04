import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private readonly themeSubject = new BehaviorSubject<'light' | 'dark'>('light');

  /** Observable para ouvir mudanças de tema em qualquer lugar da app */
  readonly currentTheme$ = this.themeSubject.asObservable();

  constructor() { }

  initTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = (savedTheme as 'light' | 'dark') || (systemPrefersDark ? 'dark' : 'light');
    this.setTheme(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Só muda automaticamente se o usuário não tiver uma preferência salva
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.themeSubject.next(theme);
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.themeSubject.value;
  }

  toggleTheme(): void {
    const newTheme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
