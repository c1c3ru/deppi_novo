import { Component } from '@angular/core';

@Component({
    selector: 'app-boletim-form',
    template: `
    <div class="boletim-form">
      <h1 class="form-title">📝 Novo Boletim</h1>
      <div class="coming-soon">
        <div class="cs-icon">🚧</div>
        <h2>Em construção</h2>
        <p>O formulário de criação de boletins estará disponível em breve.</p>
      </div>
    </div>
  `,
    styles: [`
    .boletim-form { max-width: 700px; }
    .form-title { font-size: 1.8rem; font-weight: 800; color: #1a1a2e; margin: 0 0 2rem; }
    .coming-soon { text-align: center; padding: 4rem; background: white; border-radius: 1rem; border: 2px dashed #e5e7eb; }
    .cs-icon { font-size: 4rem; margin-bottom: 1rem; }
    .coming-soon h2 { color: #4b5563; font-size: 1.4rem; margin: 0 0 0.75rem; }
    .coming-soon p { color: #9ca3af; margin: 0; }
  `]
})
export class BoletimFormComponent { }
