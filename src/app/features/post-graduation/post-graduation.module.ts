import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

const THEME_STYLES = `
  .page-container { min-height: 100vh; padding-top: 120px; }
  .page-hero { 
    text-align: center; 
    padding: 6rem 1.5rem 4rem; 
    background: linear-gradient(135deg, var(--color-primary-light), #fff); 
    position: relative;
    overflow: hidden;
  }
  .hero-decoration {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(var(--color-primary-rgb), 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  .page-icon { font-size: 5rem; margin-bottom: 2rem; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1)); }
  .page-title { 
    font-size: clamp(2rem, 5vw, 3.5rem); 
    color: var(--color-text); 
    margin: 0 0 1.5rem; 
    font-family: var(--font-display);
  }
  .page-subtitle { 
    font-size: 1.25rem; 
    color: var(--color-text-secondary); 
    max-width: 700px; 
    margin: 0 auto; 
    line-height: 1.6;
  }
  .content-area { max-width: var(--container-max-width); margin: 6rem auto; padding: 0 1.5rem; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2.5rem; }
  .info-card { padding: 0; overflow: hidden; }
  .card-top { font-size: 4rem; padding: 3rem 2rem 1rem; }
  .card-body { padding: 0 2.5rem 3rem; }
  .card-body h2 { 
    font-size: 1.6rem; 
    font-weight: 700; 
    color: var(--color-text); 
    margin: 0 0 1.2rem; 
    font-family: var(--font-display);
  }
  .card-body p { color: var(--color-text-secondary); line-height: 1.7; margin: 0; font-size: 1rem; }
`;

@Component({
  selector: 'app-post-graduation',
  template: `
    <main class="page-container ifce-bg-accent">
      <section class="page-hero reveal-up">
        <div class="hero-decoration"></div>
        <div class="page-icon">🎓</div>
        <h1 class="page-title">Pós-Graduação</h1>
        <p class="page-subtitle">
          Evolução constante e excelência acadêmica continuada. Oferecemos especializações e mestrados com foco no desenvolvimento técnico e profissional regional.
        </p>
      </section>
      
      <div class="content-area">
        <div class="card-grid">
          <div class="info-card surface">
            <div class="card-top">📚</div>
            <div class="card-body">
              <h2>Lato Sensu</h2>
              <p>Nossas especializações são desenhadas para atender às demandas diretas do mercado de Maracanaú, focando em Tecnologia, Gestão e Educação.</p>
            </div>
          </div>
          
          <div class="info-card surface">
            <div class="card-top">🏛️</div>
            <div class="card-body">
              <h2>Stricto Sensu</h2>
              <p>Programas de mestrado profissionais em parceria com IFs nacionais e redes de pesquisa de excelência científica.</p>
            </div>
          </div>
          
          <div class="info-card surface">
            <div class="card-top">📅</div>
            <div class="card-body">
              <h2>Editais e Seleções</h2>
              <p>Acesse as informações sobre os processos seletivos públicos e cronogramas acadêmicos de nossos cursos em andamento.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [THEME_STYLES]
})
export class PostGraduationComponent { }

const routes: Routes = [{ path: '', component: PostGraduationComponent }];

@NgModule({
  declarations: [PostGraduationComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule]
})
export class PostGraduationModule { }
