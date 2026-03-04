import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer ifce-bg-accent">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand-section">
            <div class="brand-identity">
              <span class="logo-text">DEPPI</span>
              <span class="logo-divider"></span>
              <span class="campus-text">MARACANAÚ</span>
            </div>
            <p class="brand-description">
              Pilar de excelência em Extensão, Pesquisa, Pós-Graduação e Inovação do IFCE Campus Maracanaú. Transformando conhecimento em desenvolvimento regional.
            </p>
            <div class="social-links">
              <a href="#" class="social-btn" aria-label="Instagram">IG</a>
              <a href="#" class="social-btn" aria-label="LinkedIn">LN</a>
              <a href="#" class="social-btn" aria-label="YouTube">YT</a>
            </div>
          </div>

          <div class="footer-links-column">
            <h4 class="column-title">Institucional</h4>
            <ul class="link-list">
              <li><a routerLink="/home">Início</a></li>
              <li><a routerLink="/research">Pesquisa</a></li>
              <li><a routerLink="/extension">Extensão</a></li>
              <li><a routerLink="/innovation">Inovação</a></li>
            </ul>
          </div>

          <div class="footer-links-column">
            <h4 class="column-title">Recursos</h4>
            <ul class="link-list">
              <li><a routerLink="/post-graduation">Pós-Graduação</a></li>
              <li><a routerLink="/boletins">Boletins Informativos</a></li>
              <li><a routerLink="/contact">Fale Conosco</a></li>
              <li><a href="https://ifce.edu.br/maracanau" target="_blank">Portal IFCE</a></li>
            </ul>
          </div>

          <div class="footer-contact-column">
            <h4 class="column-title">Contato Direto</h4>
            <div class="contact-card glass">
              <div class="contact-item">
                <span class="icon">📧</span>
                <span class="content">deppi&#64;ifce.edu.br</span>
              </div>
              <div class="contact-item">
                <span class="icon">📞</span>
                <span class="content">(85) 3401.2233</span>
              </div>
              <div class="contact-item">
                <span class="icon">📍</span>
                <span class="content">Av. Parque Central, S/N - Distrito Industrial I, Maracanaú - CE</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="copyright">
            &copy; {{ currentYear }} DEPPI - Instituto Federal do Ceará. 
            <span class="highlight">Compromisso com a Ciência e Tecnologia.</span>
          </div>
          <div class="footer-meta">
            <a href="#">Privacidade</a>
            <span class="dot"></span>
            <a href="#">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--color-background-secondary);
      border-top: 1px solid var(--color-border);
      padding: 5rem 0 2rem;
      margin-top: 4rem;
    }

    .footer-container {
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 3rem;
      margin-bottom: 4rem;
    }

    .brand-identity {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .logo-text {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.8rem;
      color: var(--color-primary);
    }

    .logo-divider {
      width: 2px;
      height: 24px;
      background: var(--color-border);
    }

    .campus-text {
      font-weight: 600;
      font-size: 0.9rem;
      letter-spacing: 0.1em;
      color: var(--color-text-secondary);
    }

    .brand-description {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      line-height: 1.7;
      margin-bottom: 2rem;
    }

    .social-links {
      display: flex;
      gap: 0.8rem;
    }

    .social-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .social-btn:hover {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      transform: translateY(-3px);
    }

    .column-title {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: var(--color-text);
      position: relative;
    }

    .column-title::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -0.5rem;
      width: 20px;
      height: 3px;
      background: var(--color-secondary);
      border-radius: var(--border-radius-full);
    }

    .link-list {
      list-style: none;
      padding: 0;
    }

    .link-list li {
      margin-bottom: 1rem;
    }

    .link-list a {
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: 0.95rem;
      transition: all var(--transition-fast);
      display: inline-block;
    }

    .link-list a:hover {
      color: var(--color-primary);
      transform: translateX(5px);
    }

    .contact-card {
      padding: 1.5rem;
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--color-border);
    }

    .contact-item {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.2rem;
    }

    .contact-item:last-child {
      margin-bottom: 0;
    }

    .contact-item .icon {
      font-size: 1.2rem;
    }

    .contact-item .content {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .footer-bottom {
      border-top: 1px solid var(--color-border);
      padding-top: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .highlight {
      color: var(--color-primary);
      font-weight: 600;
    }

    .footer-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .footer-meta a {
      color: inherit;
      text-decoration: none;
    }

    .dot {
      width: 4px;
      height: 4px;
      background: currentColor;
      border-radius: 50%;
    }

    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
    }

    @media (max-width: 640px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }
      .footer-bottom {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
