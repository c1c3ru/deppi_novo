import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <main class="home-page ifce-bg-accent">
      <!-- Hero Section -->
      <section class="hero reveal-up">
        <div class="hero-content">
          <div class="badge">Inovação & Tecnologia</div>
          <h1 class="hero-title">
            O Futuro da <span class="highlight">Ciência</span> no IFCE Maracanaú
          </h1>
          <p class="hero-subtitle">
            DEPPI — Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação. Conectando mentes brilhantes à comunidade e ao mercado.
          </p>
          <div class="hero-actions">
            <a routerLink="/boletins" class="btn btn-primary">
               Ver Boletins
            </a>
            <a routerLink="/innovation" class="btn btn-glass">
              Conheça a Inovação
            </a>
          </div>
          
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">50+</span>
              <span class="stat-label">Projetos Ativos</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">12</span>
              <span class="stat-label">Grupos de Pesquisa</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-blob"></div>
          <div class="canvas-container glass">
            <img src="assets/campus-maracanau-background.jpg" alt="Campus Maracanaú" class="campus-img" onerror="this.src='https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1000'">
            <div class="floating-card glass">
              <span class="icon">🚀</span>
              <div class="text">
                <strong>Editais Abertos</strong>
                <p>Novas oportunidades para 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="features-section">
        <div class="section-header container">
          <h2 class="section-title">Eixos de Atuação</h2>
          <p>Nossa estrutura é desenhada para fomentar o crescimento acadêmico e profissional em quatro frentes fundamentais.</p>
        </div>

        <div class="features-grid container">
          <div class="feature-card surface" routerLink="/research">
            <div class="card-icon">🔬</div>
            <h3 class="card-title">Pesquisa</h3>
            <p class="card-desc">Fomento à iniciação científica, grupos de pesquisa e produção de conhecimento tecnológico de ponta.</p>
            <div class="card-link">Saber mais &rarr;</div>
          </div>

          <div class="feature-card surface" routerLink="/extension">
            <div class="card-icon">🤝</div>
            <h3 class="card-title">Extensão</h3>
            <p class="card-desc">Integração entre o IFCE e a sociedade através de cursos, eventos e prestações de serviço técnico.</p>
            <div class="card-link">Saber mais &rarr;</div>
          </div>

          <div class="feature-card surface" routerLink="/innovation">
            <div class="card-icon">💡</div>
            <h3 class="card-title">Inovação</h3>
            <p class="card-desc">Incentivo ao empreendedorismo, proteção à propriedade intelectual e parcerias com a indústria.</p>
            <div class="card-link">Saber mais &rarr;</div>
          </div>

          <div class="feature-card surface" routerLink="/post-graduation">
            <div class="card-icon">🎓</div>
            <h3 class="card-title">Pós-Graduação</h3>
            <p class="card-desc">Aperfeiçoamento constante através de cursos Lato Sensu e Stricto Sensu de alta qualidade.</p>
            <div class="card-link">Saber mais &rarr;</div>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .home-page { 
      min-height: 100vh; 
      padding-top: 120px;
      overflow: hidden;
    }

    .hero {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 4rem;
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: 2rem 1.5rem 6rem;
      align-items: center;
    }

    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: rgba(var(--color-primary-rgb), 0.1);
      color: var(--color-primary);
      border-radius: var(--border-radius-full);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2rem;
    }

    .hero-title {
      font-size: clamp(2.5rem, 6vw, 3.8rem);
      color: var(--color-text);
      line-height: 1.05;
      margin-bottom: 1.5rem;
    }

    .highlight {
      color: var(--color-primary);
      position: relative;
    }

    .highlight::after {
      content: '';
      position: absolute;
      bottom: 0.1em;
      left: 0;
      width: 100%;
      height: 0.2em;
      background: rgba(var(--color-primary-rgb), 0.1);
      z-index: -1;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      line-height: 1.7;
      margin-bottom: 3rem;
      max-width: 550px;
    }

    .hero-actions {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 4rem;
    }

    .hero-stats {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: var(--color-border);
    }

    .stat-value {
      display: block;
      font-family: var(--font-display);
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--color-primary);
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .hero-visual {
      position: relative;
    }

    .visual-blob {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120%;
      height: 120%;
      background: radial-gradient(circle, rgba(var(--color-primary-rgb), 0.15) 0%, transparent 70%);
      border-radius: 50%;
      filter: blur(40px);
      z-index: -1;
    }

    .canvas-container {
      position: relative;
      padding: 1rem;
      border-radius: var(--border-radius-xl);
      border: 1px solid var(--glass-border);
      overflow: visible;
    }

    .campus-img {
      width: 100%;
      height: 480px;
      object-fit: cover;
      border-radius: var(--border-radius-lg);
      display: block;
    }

    .floating-card {
      position: absolute;
      bottom: 2rem;
      right: -2rem;
      padding: 1.2rem;
      border-radius: var(--border-radius-lg);
      display: flex;
      gap: 1rem;
      align-items: center;
      box-shadow: var(--shadow-lg);
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .features-section {
      padding: 8rem 0;
      background: var(--color-background-secondary);
    }

    .section-header {
      text-align: center;
      margin-bottom: 5rem;
    }

    .section-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
    }

    .card-icon {
      font-size: 3.5rem;
      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 1.4rem;
      margin-bottom: 1rem;
      color: var(--color-text);
    }

    .card-desc {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .card-link {
      font-weight: 700;
      color: var(--color-primary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    @media (max-width: 1024px) {
      .hero {
        grid-template-columns: 1fr;
        text-align: center;
        padding-top: 4rem;
      }
      .hero-content { order: 2; }
      .hero-visual { order: 1; max-width: 600px; margin: 0 auto; }
      .hero-subtitle { margin-left: auto; margin-right: auto; }
      .hero-actions { justify-content: center; }
      .hero-stats { justify-content: center; }
      .floating-card { right: 1rem; }
    }
  `]
})
export class HomeComponent { }

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class HomeModule { }
