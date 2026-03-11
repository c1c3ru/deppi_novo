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
              Pilar de excelência em Extensão, Pesquisa, Pós-Graduação e
              Inovação do IFCE Campus Maracanaú. Transformando conhecimento em
              desenvolvimento regional.
            </p>
            <div class="social-links">
              <a
                href="https://www.instagram.com/ifcemaracanauoficial/"
                target="_blank"
                class="social-btn"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://br.linkedin.com/in/deppi-ifce-maracana%C3%BA-183296215"
                target="_blank"
                class="social-btn"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                  />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/tvifce"
                target="_blank"
                class="social-btn"
                aria-label="YouTube TV IFCE"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
                  />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/ifcecampusdemaracanau"
                target="_blank"
                class="social-btn"
                aria-label="YouTube IFCE Maracanaú"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
                  />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
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
              <li>
                <a href="https://ifce.edu.br/maracanau" target="_blank"
                  >Portal IFCE</a
                >
              </li>
            </ul>
          </div>

          <div class="footer-contact-column">
            <h4 class="column-title">Contato Direto</h4>
            <div class="contact-card glass">
              <div class="contact-item">
                <span class="icon">📧</span>
                <span class="content">deppi.maracanau&#64;ifce.edu.br</span>
              </div>
              <div class="contact-item">
                <span class="icon">📞</span>
                <span class="content">(85) 3401.2233</span>
              </div>
              <div class="contact-item">
                <span class="icon">📍</span>
                <span class="content"
                  >Av. Parque Central, S/N - Distrito Industrial I, Maracanaú -
                  CE</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="copyright">
            &copy; {{ currentYear }} DEPPI - Instituto Federal do Ceará.
            <span class="highlight"
              >Compromisso com a Ciência e Tecnologia.</span
            >
          </div>
          <div class="footer-meta">
            <a routerLink="/privacy" class="privacy-note"
              >Não fazemos uso de cookies e nos guiamos pela LGPD.</a
            >
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
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

      .privacy-note {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        text-align: right;
        text-decoration: none;
        transition: color 0.3s;
      }
      .privacy-note:hover {
        color: var(--color-primary);
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
    `,
  ],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
