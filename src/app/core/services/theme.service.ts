import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

/**
 * O site abre sempre no modo claro. A preferência de cor do sistema
 * operacional é ignorada de propósito; o escuro só aparece quando a pessoa
 * clica no botão de tema, e essa escolha fica salva no navegador.
 *
 * A chave antiga ('theme') gravava também o tema vindo do sistema, então quem
 * usa o SO no escuro ficava preso nele. Ela é descartada e a escolha manual
 * passa a morar em 'theme-preference'. O script inline de src/index.html lê a
 * mesma chave antes do primeiro paint (se ele mudar, recalcule o hash do CSP
 * em nginx.conf).
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  static readonly DEFAULT_THEME: Theme = 'light';
  private readonly THEME_KEY = 'theme-preference';
  private readonly LEGACY_THEME_KEY = 'theme';
  private readonly themeSubject = new BehaviorSubject<Theme>(
    ThemeService.DEFAULT_THEME
  );

  /** Observable para ouvir mudanças de tema em qualquer lugar da app */
  readonly currentTheme$ = this.themeSubject.asObservable();

  initTheme(): void {
    this.removeLegacyKey();
    const saved = this.readSaved();
    this.applyTheme(saved ?? ThemeService.DEFAULT_THEME);
  }

  /** Aplica e salva o tema escolhido pela pessoa. */
  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch {
      // Navegação privada ou storage bloqueado: o tema vale só nesta visita.
    }
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  toggleTheme(): void {
    this.setTheme(this.getCurrentTheme() === 'light' ? 'dark' : 'light');
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    this.themeSubject.next(theme);
  }

  private readSaved(): Theme | null {
    try {
      const saved = localStorage.getItem(this.THEME_KEY);
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch {
      return null;
    }
  }

  private removeLegacyKey(): void {
    try {
      localStorage.removeItem(this.LEGACY_THEME_KEY);
    } catch {
      // ignora
    }
  }
}
