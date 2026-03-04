import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Component inline para a home
import { Component } from '@angular/core';

@Component({
    selector: 'app-home',
    template: `
    <main class="home-page">
      <section class="hero">
        <div class="hero-content">
          <img src="assets/icons/ifce-logo.svg" alt="IFCE Logo" class="hero-logo">
          <h1 class="hero-title">DEPPI — IFCE Maracanaú</h1>
          <p class="hero-subtitle">
            Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação
          </p>
          <div class="hero-actions">
            <a routerLink="/boletins" class="btn btn-primary">Ver Boletins</a>
            <a routerLink="/research" class="btn btn-outline">Pesquisa</a>
          </div>
        </div>
        <div class="hero-image">
          <img src="assets/campus-maracanau-background.jpg" alt="Campus Maracanaú" class="campus-img">
        </div>
      </section>

      <section class="features">
        <div class="features-grid">
          <div class="feature-card" routerLink="/research">
            <div class="feature-icon">🔬</div>
            <h2 class="feature-title">Pesquisa</h2>
            <p class="feature-desc">Projetos e iniciativas de pesquisa científica e tecnológica</p>
          </div>
          <div class="feature-card" routerLink="/extension">
            <div class="feature-icon">🤝</div>
            <h2 class="feature-title">Extensão</h2>
            <p class="feature-desc">Ações que aproximam o campus da comunidade</p>
          </div>
          <div class="feature-card" routerLink="/innovation">
            <div class="feature-icon">💡</div>
            <h2 class="feature-title">Inovação</h2>
            <p class="feature-desc">Projetos inovadores e empreendedorismo</p>
          </div>
          <div class="feature-card" routerLink="/post-graduation">
            <div class="feature-icon">🎓</div>
            <h2 class="feature-title">Pós-Graduação</h2>
            <p class="feature-desc">Cursos de especialização, mestrado e mais</p>
          </div>
        </div>
      </section>
    </main>
  `,
    styles: [`
    .home-page { min-height: 100vh; padding-top: 80px; }

    .hero {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
      align-items: center;
    }
    .hero-logo { height: 80px; margin-bottom: 1rem; }
    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--color-text-primary, #1a1a2e);
      line-height: 1.2;
      margin: 0 0 1rem;
    }
    .hero-subtitle {
      font-size: 1.1rem;
      color: var(--color-text-secondary, #6b7280);
      margin-bottom: 2rem;
    }
    .hero-actions { display: flex; gap: 1rem; }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.75rem;
      border-radius: 0.5rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }
    .btn-primary {
      background: #0066b3;
      color: white;
    }
    .btn-primary:hover { background: #0052a3; transform: translateY(-1px); }
    .btn-outline {
      border: 2px solid #0066b3;
      color: #0066b3;
    }
    .btn-outline:hover { background: #f0f6ff; transform: translateY(-1px); }

    .campus-img {
      width: 100%;
      height: 350px;
      object-fit: cover;
      border-radius: 1rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .features { padding: 4rem 2rem; background: #f8fafc; }
    .features-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
    }
    .feature-card {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid #e5e7eb;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,102,179,0.15);
      border-color: #0066b3;
    }
    .feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .feature-title { font-size: 1.2rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.5rem; }
    .feature-desc { color: #6b7280; font-size: 0.9rem; margin: 0; }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; }
      .campus-img { height: 200px; }
      .hero-title { font-size: 1.8rem; }
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
