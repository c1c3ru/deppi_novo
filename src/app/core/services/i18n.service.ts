import { Injectable } from '@angular/core';

interface Translations {
  [key: string]: string | Translations;
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private translations: Translations = {};
  private currentLanguage = 'pt-br';

  /**
   * Carrega o idioma padrão na inicialização
   */
  async initialize(): Promise<void> {
    await this.loadLanguage(this.currentLanguage);
  }

  /**
   * Carrega traduções para um idioma
   */
  async loadLanguage(lang: string): Promise<void> {
    try {
      const response = await fetch(`/assets/i18n/${lang}.json`);
      if (response.ok) {
        this.translations = await response.json();
        this.currentLanguage = lang;
      }
    } catch (e) {
      console.warn(`I18nService: falha ao carregar idioma '${lang}'`, e);
    }
  }

  /**
   * Traduz uma chave (ex: 'boletins.title')
   */
  translate(key: string, params?: Record<string, string>): string {
    const parts = key.split('.');
    let current: Translations | string = this.translations;

    for (const part of parts) {
      if (typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return key; // fallback para a própria chave
      }
    }

    let result = typeof current === 'string' ? current : key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{{${k}}}`, 'g'), v);
      });
    }

    return result;
  }

  get language(): string {
    return this.currentLanguage;
  }
}
