import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

const COMMON_STYLES = `
  .page-container { min-height: 100vh; padding-top: 80px; }
  .page-hero { text-align: center; padding: 4rem 2rem 2rem; background: linear-gradient(135deg,#f0fff4,#d1fae5); }
  .page-icon { font-size: 4rem; margin-bottom: 1rem; }
  .page-title { font-size: 2.5rem; font-weight: 800; color: #1a1a2e; margin: 0 0 1rem; }
  .page-subtitle { font-size: 1.1rem; color: #6b7280; max-width: 600px; margin: 0 auto; }
  .content-area { max-width: 1200px; margin: 3rem auto; padding: 0 2rem; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
  .info-card { background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; transition: all 0.2s; }
  .info-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,150,100,0.12); }
  .card-img { width: 100%; height: 180px; object-fit: cover; }
  .card-icon { font-size: 3rem; padding: 1.5rem 1.5rem 0; }
  .card-body { padding: 1.5rem; }
  .card-body h2 { font-size: 1.2rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.75rem; }
  .card-body p { color: #6b7280; line-height: 1.6; margin: 0; }
`;

@Component({
  selector: 'app-extension',
  template: `
    <main class="page-container">
      <div class="page-hero">
        <div class="page-icon">🤝</div>
        <h1 class="page-title">Extensão</h1>
        <p class="page-subtitle">Projetos de extensão que aproximam o IFCE Maracanaú da comunidade</p>
      </div>
      <div class="content-area">
        <div class="card-grid">
          <div class="info-card">
            <img src="assets/extensao/gestores.jpg" alt="Extensão" class="card-img" onerror="this.style.display='none'">
            <div class="card-body">
              <h2>Ações Comunitárias</h2>
              <p>Atividades de extensão voltadas para capacitação profissional, inclusão digital e desenvolvimento social.</p>
            </div>
          </div>
          <div class="info-card">
            <img src="assets/extensao/projeto.jpg" alt="Projetos" class="card-img" onerror="this.style.display='none'">
            <div class="card-body">
              <h2>Projetos Ativos</h2>
              <p>Conheça os projetos de extensão em andamento no campus e como participar.</p>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📋</div>
            <div class="card-body">
              <h2>Relatórios</h2>
              <p>Relatórios e resultados das ações de extensão realizadas pelo DEPPI.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [COMMON_STYLES]
})
export class ExtensionComponent { }

const routes: Routes = [{ path: '', component: ExtensionComponent }];

@NgModule({
  declarations: [ExtensionComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule]
})
export class ExtensionModule { }
