/**
 * Sistema de Internacionalização - DEPPI IFCE Maracanaú
 * Gerenciamento de textos e tradução
 */

class I18nManager {
  constructor() {
    this.currentLanguage = 'pt-br';
    this.translations = {};
    this.fallbackLanguage = 'pt-br';
    this.init();
  }

  async init() {
    try {
      await this.loadLanguage(this.currentLanguage);
      this.setupLanguageDetection();
      this.applyTranslations();
    } catch (error) {
      console.error('Erro ao inicializar i18n:', error);
    }
  }

  async loadLanguage(language) {
    try {
      const response = await fetch(`/assets/i18n/${language}.json`);
      if (!response.ok) {
        throw new Error(`Falha ao carregar idioma: ${language}`);
      }
      this.translations[language] = await response.json();
    } catch (error) {
      console.error(`Erro ao carregar idioma ${language}:`, error);
      if (language !== this.fallbackLanguage) {
        await this.loadLanguage(this.fallbackLanguage);
        this.currentLanguage = this.fallbackLanguage;
      }
    }
  }

  setupLanguageDetection() {
    // Detectar idioma do navegador
    const browserLanguage = navigator.language || navigator.userLanguage;
    const shortLanguage = browserLanguage.split('-')[0];
    
    // Verificar se o idioma do navegador está disponível
    if (shortLanguage === 'pt' && this.currentLanguage === 'pt-br') {
      // Já está configurado para português
      return;
    }

    // Verificar preferência salva no localStorage
    const savedLanguage = localStorage.getItem('deppi-language');
    if (savedLanguage && savedLanguage !== this.currentLanguage) {
      this.setLanguage(savedLanguage);
    }
  }

  async setLanguage(language) {
    if (language === this.currentLanguage) return;

    if (!this.translations[language]) {
      await this.loadLanguage(language);
    }

    this.currentLanguage = language;
    localStorage.setItem('deppi-language', language);
    
    // Atualizar atributo lang no HTML
    document.documentElement.lang = language;
    
    // Aplicar traduções
    this.applyTranslations();
    
    // Disparar evento de mudança de idioma
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language } 
    }));
  }

  translate(key, params = {}) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];

    // Navegar pela estrutura do objeto
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Tentar fallback
        translation = this.translations[this.fallbackLanguage];
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            return key; // Retornar a chave se não encontrar
          }
        }
        break;
      }
    }

    // Se não for string, retornar a chave
    if (typeof translation !== 'string') {
      return key;
    }

    // Substituir parâmetros
    return this.interpolate(translation, params);
  }

  interpolate(text, params) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  applyTranslations() {
    // Aplicar traduções a elementos com atributo data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.translate(key);
      
      // Preservar HTML se o elemento tiver data-i18n-html
      if (element.hasAttribute('data-i18n-html')) {
        element.innerHTML = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Aplicar traduções a placeholders
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.translate(key);
    });

    // Aplicar traduções a títulos
    const titles = document.querySelectorAll('[data-i18n-title]');
    titles.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.translate(key);
    });

    // Aplicar traduções a valores de inputs
    const values = document.querySelectorAll('[data-i18n-value]');
    values.forEach(element => {
      const key = element.getAttribute('data-i18n-value');
      element.value = this.translate(key);
    });

    // Atualizar atributo lang no HTML
    document.documentElement.lang = this.currentLanguage;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return Object.keys(this.translations);
  }

  // Método para uso em templates
  t(key, params = {}) {
    return this.translate(key, params);
  }

  // Método para adicionar traduções dinamicamente
  addTranslations(language, translations) {
    if (!this.translations[language]) {
      this.translations[language] = {};
    }
    this.translations[language] = { 
      ...this.translations[language], 
      ...translations 
    };
  }

  // Método para obter todas as traduções de um idioma
  getAllTranslations(language = this.currentLanguage) {
    return this.translations[language] || {};
  }

  // Método para exportar traduções
  exportTranslations(language = this.currentLanguage) {
    return JSON.stringify(this.translations[language] || {}, null, 2);
  }

  // Método para validar estrutura de traduções
  validateTranslations(language) {
    const requiredKeys = [
      'common',
      'navigation',
      'home',
      'research',
      'extension',
      'innovation',
      'postGraduation',
      'boletins',
      'login',
      'contact',
      'footer'
    ];

    const translations = this.translations[language];
    const missing = [];

    requiredKeys.forEach(key => {
      if (!translations || !translations[key]) {
        missing.push(key);
      }
    });

    return {
      valid: missing.length === 0,
      missing
    };
  }
}

// Instância global
let i18nManager;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  i18nManager = new I18nManager();
  
  // Tornar disponível globalmente
  window.i18n = i18nManager;
  
  // Adicionar atalho global para tradução
  window.t = (key, params) => i18nManager.translate(key, params);
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18nManager;
}

// Funções utilitárias globais
window.translate = function(key, params = {}) {
  return window.i18n ? window.i18n.translate(key, params) : key;
};

window.setLanguage = function(language) {
  if (window.i18n) {
    return window.i18n.setLanguage(language);
  }
};

// Auto-aplicar traduções quando conteúdo dinâmico for adicionado
const observer = new MutationObserver(() => {
  if (window.i18n) {
    window.i18n.applyTranslations();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
