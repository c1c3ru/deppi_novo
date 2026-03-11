import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    gtag: (command: string, action: any, options?: any) => void;
    dataLayer: any[];
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly router = inject(Router);
  private readonly isProduction = environment.production;
  private readonly trackingId = environment.googleAnalyticsId;

  constructor() {
    this.initializeGoogleAnalytics();
    this.trackPageViews();
  }

  /**
   * Inicializa o Google Analytics
   */
  private initializeGoogleAnalytics(): void {
    if (!this.isProduction || !this.trackingId) return;

    // Carregar o script do Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`;
    document.head.appendChild(script);

    // Configurar o gtag
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', this.trackingId, {
        send_page_view: false,
        custom_map: {
          custom_parameter_1: 'user_role',
          custom_parameter_2: 'campus',
        },
      });
    };
  }

  /**
   * Rastreia visualizações de página
   */
  private trackPageViews(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Rastreia uma visualização de página
   */
  trackPageView(path: string): void {
    if (!this.isProduction || !window.gtag) return;

    window.gtag('config', this.trackingId, {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }

  /**
   * Rastreia um evento personalizado
   */
  trackEvent(
    action: string,
    category: string,
    label?: string,
    value?: number
  ): void {
    if (!this.isProduction || !window.gtag) return;

    const eventParams: any = {
      event_category: category,
      event_label: label,
      value: value,
    };

    window.gtag('event', action, eventParams);
  }

  /**
   * Rastreia eventos de login
   */
  trackLogin(method: string, success: boolean = true): void {
    this.trackEvent('login', 'authentication', method, success ? 1 : 0);
  }

  /**
   * Rastreia eventos de logout
   */
  trackLogout(): void {
    this.trackEvent('logout', 'authentication', 'user_logout');
  }

  /**
   * Rastreia downloads de arquivos
   */
  trackDownload(fileName: string, fileType: string): void {
    this.trackEvent('download', 'file', `${fileType}_${fileName}`);
  }

  /**
   * Rastreia visualizações de boletins
   */
  trackBoletimView(boletimId: string, boletimTitle: string): void {
    this.trackEvent('view_boletim', 'content', boletimTitle);
    this.trackEvent('page_view', 'boletim', boletimId);
  }

  /**
   * Rastreia busca no site
   */
  trackSearch(searchTerm: string, resultsCount: number): void {
    this.trackEvent('search', 'site_search', searchTerm, resultsCount);
  }

  /**
   * Rastreia envio de formulários
   */
  trackFormSubmission(formName: string, success: boolean = true): void {
    this.trackEvent('form_submit', 'engagement', formName, success ? 1 : 0);
  }

  /**
   * Rastreia cliques em links externos
   */
  trackExternalLinkClick(url: string, linkText: string): void {
    this.trackEvent('click', 'outbound', linkText);
    this.trackEvent('outbound_click', 'navigation', url);
  }

  /**
   * Rastreia erros
   */
  trackError(error: Error, context?: string): void {
    this.trackEvent('error', 'application', context || 'unknown');
  }

  /**
   * Rastreia performance
   */
  trackPerformance(metricName: string, value: number): void {
    this.trackEvent('performance_timing', 'performance', metricName, value);
  }

  /**
   * Define dimensões personalizadas
   */
  setCustomDimension(dimension: string, value: string): void {
    if (!this.isProduction || !window.gtag) return;

    window.gtag('config', this.trackingId, {
      [dimension]: value,
    });
  }

  /**
   * Define user ID para cross-device tracking
   */
  setUserId(userId: string): void {
    if (!this.isProduction || !window.gtag) return;

    window.gtag('config', this.trackingId, {
      user_id: userId,
    });
  }

  /**
   * Rastreia tempo na página
   */
  trackTimeOnPage(path: string, timeInSeconds: number): void {
    this.trackEvent('time_on_page', 'engagement', path, timeInSeconds);
  }

  /**
   * Rastreia scroll depth
   */
  trackScrollDepth(percentage: number): void {
    this.trackEvent('scroll_depth', 'engagement', `${percentage}%`);
  }

  /**
   * Rastreia interações com componentes
   */
  trackComponentInteraction(componentName: string, action: string): void {
    this.trackEvent(
      'component_interaction',
      'ui',
      `${componentName}_${action}`
    );
  }

  /**
   * Rastreia uso de recursos de acessibilidade
   */
  trackAccessibilityFeature(feature: string): void {
    this.trackEvent('accessibility', 'accessibility', feature);
  }

  /**
   * Rastreia mudança de tema
   */
  trackThemeChange(theme: string): void {
    this.trackEvent('theme_change', 'ui', theme);
  }

  /**
   * Rastreia mudança de idioma
   */
  trackLanguageChange(language: string): void {
    this.trackEvent('language_change', 'ui', language);
  }

  /**
   * Rastreia compartilhamento de conteúdo
   */
  trackShare(platform: string, contentType: string, contentId: string): void {
    this.trackEvent('share', 'social', `${platform}_${contentType}`);
  }

  /**
   * Rastreia impressões de elementos
   */
  trackImpression(elementName: string, context?: string): void {
    this.trackEvent(
      'impression',
      'content',
      context ? `${elementName}_${context}` : elementName
    );
  }

  /**
   * Rastreia conversões
   */
  trackConversion(conversionType: string, value?: number): void {
    this.trackEvent('conversion', 'conversion', conversionType, value);
  }

  /**
   * Rastreia métricas de Core Web Vitals
   */
  trackCoreWebVitals(metricName: string, value: number, id: string): void {
    if (!this.isProduction || !window.gtag) return;

    // Enviar para Google Analytics
    window.gtag('event', metricName, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(metricName === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    });

    // Também rastrear como performance
    this.trackPerformance(metricName, value);
  }

  /**
   * Rastreia sessão do usuário
   */
  trackSessionStart(sessionId: string): void {
    this.trackEvent('session_start', 'session', sessionId);
  }

  /**
   * Rastreia fim de sessão
   */
  trackSessionEnd(sessionId: string, duration: number): void {
    this.trackEvent('session_end', 'session', sessionId, duration);
  }

  /**
   * Envia exceção para o Google Analytics
   */
  trackException(description: string, isFatal: boolean = false): void {
    if (!this.isProduction || !window.gtag) return;

    window.gtag('event', 'exception', {
      description,
      fatal: isFatal,
    });
  }

  /**
   * Desativa rastreamento (para conformidade com LGPD)
   */
  disableTracking(): void {
    if (window.gtag) {
      window.gtag('config', this.trackingId, {
        send_page_view: false,
      });
    }
  }

  /**
   * Ativa rastreamento
   */
  enableTracking(): void {
    if (window.gtag) {
      window.gtag('config', this.trackingId, {
        send_page_view: true,
      });
    }
  }
}
