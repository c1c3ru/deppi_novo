import { Component } from '@angular/core';
import { ANAIS_BASE_STYLES } from '../../anais.styles';
import { ANAIS_INFO } from '../../anais.utils';

@Component({
  standalone: false,
  selector: 'app-anais-corpo-editorial',
  template: `
    <article class="anais-card">
      <h2>Corpo editorial</h2>

      <h3>Coordenação Editorial</h3>
      <p>
        <strong>{{ info.coordenacao }}</strong
        ><br />
        IFCE Campus Maracanaú
      </p>

      <h3>Comissão Científica e Editorial</h3>
      <ul class="comissao">
        <li *ngFor="let nome of info.comissao">{{ nome }}</li>
      </ul>

      <h3>Revisão</h3>
      <p>
        <ng-container *ngFor="let nome of info.revisao; let ultimo = last">
          {{ nome }}<br *ngIf="!ultimo" />
        </ng-container>
      </p>
    </article>
  `,
  styles: [
    ANAIS_BASE_STYLES,
    `
      .comissao {
        columns: 2;
        padding-left: 1.2rem;
        margin: 0 0 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.8;
      }

      @media (max-width: 800px) {
        .comissao {
          columns: 1;
        }
      }
    `,
  ],
})
export class AnaisCorpoEditorialComponent {
  readonly info = ANAIS_INFO;
}
