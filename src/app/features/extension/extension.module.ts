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
  selector: 'app-extension',
  template: `
    <main class="page-container ifce-bg-accent">
      <section class="page-hero reveal-up">
        <div class="hero-decoration"></div>
        <div class="page-icon">🤝</div>
        <h1 class="page-title">Projetos de Extensão</h1>
        <p class="page-subtitle">
          Promovendo o diálogo transformador entre o Instituto e a Sociedade. O DEPPI conecta o conhecimento acadêmico às necessidades da comunidade regional.
        </p>
      </section>
      
      <div class="content-area">
        <div class="card-grid">
          <div class="info-card surface">
            <div class="card-top">🎨</div>
            <div class="card-body">
              <h2>Cursos e Eventos</h2>
              <p>Oferecemos capacitação, oficinas e eventos culturais abertos ao público, levando a excelência do IFCE para além dos muros do campus.</p>
            </div>
          </div>
          
          <div class="info-card surface">
            <div class="card-top">🏙️</div>
            <div class="card-body">
              <h2>Ações Comunitárias</h2>
              <p>Nossos projetos visam o desenvolvimento social, econômico e cultural através de intervenções diretas nas comunidades locais.</p>
            </div>
          </div>
          
          <div class="info-card surface">
            <div class="card-top">🛠️</div>
            <div class="card-body">
              <h2>Prestação de Serviços</h2>
              <p>Apoio técnico especializado para empresas, associações e prefeituras, fortalecendo a economia regional com a expertise do nosso corpo docente.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [THEME_STYLES]
})
export class ExtensionComponent { }

const routes: Routes = [{ path: '', component: ExtensionComponent }];

@NgModule({
  declarations: [ExtensionComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule]
})
export class ExtensionModule { }
