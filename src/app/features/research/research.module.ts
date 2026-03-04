import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

const COMMON_STYLES = `
  .page-container { min-height: 100vh; padding-top: 80px; }
  .page-hero { text-align: center; padding: 4rem 2rem 2rem; background: linear-gradient(135deg,#f0f6ff,#e8f4fd); }
  .page-icon { font-size: 4rem; margin-bottom: 1rem; }
  .page-title { font-size: 2.5rem; font-weight: 800; color: #1a1a2e; margin: 0 0 1rem; }
  .page-subtitle { font-size: 1.1rem; color: #6b7280; max-width: 600px; margin: 0 auto; }
  .content-area { max-width: 1200px; margin: 3rem auto; padding: 0 2rem; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
  .info-card { background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; transition: all 0.2s; }
  .info-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,102,179,0.12); }
  .card-img { width: 100%; height: 180px; object-fit: cover; }
  .card-icon { font-size: 3rem; padding: 1.5rem 1.5rem 0; }
  .card-body { padding: 1.5rem; }
  .card-body h2 { font-size: 1.2rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.75rem; }
  .card-body p { color: #6b7280; line-height: 1.6; margin: 0; }
`;

@Component({
  selector: 'app-research',
  template: `
    <main class="page-container">
      <div class="page-hero">
        <div class="page-icon">🔬</div>
        <h1 class="page-title">Pesquisa</h1>
        <p class="page-subtitle">Conheça os projetos e iniciativas de pesquisa científica e tecnológica do DEPPI</p>
      </div>
      <div class="content-area">
        <div class="card-grid">
          <div class="info-card">
            <img src="assets/pesquisa/managers.jpg" alt="Pesquisa" class="card-img" onerror="this.style.display='none'">
            <div class="card-body">
              <h2>Projetos em Andamento</h2>
              <p>O DEPPI coordena projetos de pesquisa aplicada em parceria com empresas e instituições do Ceará e do Brasil.</p>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📊</div>
            <div class="card-body">
              <h2>Grupos de Pesquisa</h2>
              <p>Nossos grupos de pesquisa atuam em áreas como tecnologia, educação, sustentabilidade e inovação social.</p>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📝</div>
            <div class="card-body">
              <h2>Publicações</h2>
              <p>Acesse os artigos, relatórios e publicações produzidos pelos pesquisadores do campus.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [COMMON_STYLES]
})
export class ResearchComponent { }

const routes: Routes = [{ path: '', component: ResearchComponent }];

@NgModule({
  declarations: [ResearchComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule]
})
export class ResearchModule { }
