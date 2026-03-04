import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="footer-title">DEPPI</h3>
            <p class="footer-description">
              Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação
              <br>
              IFCE Campus Maracanaú
            </p>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">Links Úteis</h4>
            <ul class="footer-links">
              <li><a routerLink="/home">Início</a></li>
              <li><a routerLink="/research">Pesquisa</a></li>
              <li><a routerLink="/extension">Extensão</a></li>
              <li><a routerLink="/contact">Contato</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">Área Restrita</h4>
            <ul class="footer-links">
              <li><a routerLink="/boletins">Boletins</a></li>
              <li><a href="#" onclick="return false;">Login</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">Contato</h4>
            <div class="contact-info">
              <p>📧 deppi&#64;ifce.edu.br</p>
              <p>📞 (85) 1234-5678</p>
              <p>📍 Av. XYZ, 123 - Maracanaú/CE</p>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-copyright">
            <p>&copy; 2024 DEPPI - IFCE Maracanaú. Todos os direitos reservados.</p>
          </div>
          <div class="footer-social">
            <!-- Ícones de redes sociais podem ser adicionados aqui -->
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--color-background-secondary);
      border-top: 1px solid var(--color-border);
      margin-top: auto;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1rem 1rem;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h3,
    .footer-section h4 {
      color: var(--color-text);
      margin-bottom: 1rem;
    }

    .footer-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .footer-subtitle {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .footer-description {
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    .footer-links {
      list-style: none;
      padding: 0;
    }

    .footer-links li {
      margin-bottom: 0.5rem;
    }

    .footer-links a {
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .footer-links a:hover {
      color: var(--color-primary);
    }

    .contact-info p {
      margin-bottom: 0.5rem;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .footer-bottom {
      border-top: 1px solid var(--color-border);
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-copyright {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }

    .footer-social {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .footer-container {
        padding: 2rem 0.5rem 1rem;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .footer-bottom {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  constructor() { }
}
