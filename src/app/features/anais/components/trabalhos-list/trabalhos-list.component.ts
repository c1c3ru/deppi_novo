import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RevistaArtigo } from '../../../../shared/models';
import { extrairLinkPdf } from '../../anais.utils';

/**
 * Lista linear de trabalhos, no formato dos anais da Editora Realize:
 * ícone de documento, título, autores, resumo recolhível e ações.
 * Os controles de edição só existem no DOM quando canEdit é true.
 */
@Component({
  standalone: false,
  selector: 'app-anais-trabalhos-list',
  template: `
    <ol class="trabalhos" [attr.start]="startIndex + 1">
      <li
        class="trabalho"
        *ngFor="let a of artigos; trackBy: trackById"
        data-testid="trabalho"
      >
        <span class="doc-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M14 2v5h5M8 13h8M8 17h5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
            />
          </svg>
        </span>

        <div class="trabalho-body">
          <h3 class="trabalho-title">
            <a [routerLink]="['/anais/artigos', a.id]">{{ a.title }}</a>
          </h3>
          <p class="trabalho-authors" *ngIf="a.authors">{{ a.authors }}</p>

          <div class="trabalho-actions">
            <a
              class="action action-primary"
              [routerLink]="['/anais/artigos', a.id]"
              >Acessar</a
            >
            <a
              *ngIf="pdfDe(a) as pdf"
              class="action"
              [href]="pdf"
              target="_blank"
              rel="noopener"
              >PDF</a
            >
            <button
              *ngIf="a.summary"
              type="button"
              class="action action-ghost"
              [attr.aria-expanded]="aberto(a.id)"
              [attr.aria-controls]="'resumo-' + a.id"
              (click)="alternarResumo(a.id)"
            >
              {{ aberto(a.id) ? 'Ocultar resumo' : 'Resumo' }}
            </button>

            <ng-container *ngIf="canEdit">
              <span class="divider" aria-hidden="true"></span>
              <a
                class="action action-edit"
                [routerLink]="['/anais/admin/artigos', a.id, 'editar']"
                data-testid="editar-trabalho"
                >Editar</a
              >
              <button
                type="button"
                class="action action-danger"
                data-testid="excluir-trabalho"
                (click)="excluir.emit(a)"
              >
                Excluir
              </button>
            </ng-container>
          </div>

          <p
            *ngIf="a.summary && aberto(a.id)"
            class="trabalho-resumo"
            [id]="'resumo-' + a.id"
          >
            {{ a.summary }}
          </p>
        </div>
      </li>
    </ol>
  `,
  styles: [
    `
      .trabalhos {
        list-style: none;
        margin: 0;
        padding: 0;
        border-top: 1px solid var(--color-border);
      }

      .trabalho {
        display: flex;
        gap: 1rem;
        padding: 1.25rem 0.25rem;
        border-bottom: 1px solid var(--color-border);
      }

      .doc-icon {
        flex: none;
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: var(--border-radius-sm);
        background: var(--color-primary-light);
        color: var(--color-primary-dark);
      }

      .trabalho-body {
        min-width: 0;
        flex: 1;
      }

      .trabalho-title {
        font-size: 1.05rem;
        line-height: 1.4;
        margin: 0 0 0.3rem;
      }

      .trabalho-title a {
        color: var(--color-text);
        text-decoration: none;
      }

      .trabalho-title a:hover {
        color: var(--color-primary);
        text-decoration: underline;
      }

      .trabalho-authors {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.02em;
        margin: 0 0 0.7rem;
      }

      .trabalho-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }

      .action {
        font: inherit;
        font-size: 0.8rem;
        font-weight: 700;
        padding: 0.35rem 0.8rem;
        border-radius: var(--border-radius-sm);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text);
        text-decoration: none;
        cursor: pointer;
        line-height: 1.4;
      }

      .action:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      .action-primary {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: var(--color-on-primary);
      }

      .action-primary:hover {
        background: var(--color-primary-dark);
        color: var(--color-on-primary);
      }

      .action-ghost {
        border-color: transparent;
        background: transparent;
        color: var(--color-text-secondary);
      }

      .action-edit {
        color: var(--color-primary-dark);
      }

      .action-danger {
        color: var(--color-error-text);
      }

      .action-danger:hover {
        border-color: var(--color-error);
        color: var(--color-error);
      }

      .divider {
        width: 1px;
        height: 1.2rem;
        background: var(--color-border);
        margin: 0 0.25rem;
      }

      .trabalho-resumo {
        margin: 0.9rem 0 0;
        padding: 0.9rem 1rem;
        background: var(--color-background-secondary);
        border-left: 3px solid var(--color-primary);
        border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
        color: var(--color-text-secondary);
        font-size: 0.92rem;
        line-height: 1.65;
        white-space: pre-line;
      }

      @media (max-width: 640px) {
        .doc-icon {
          display: none;
        }
      }
    `,
  ],
})
export class AnaisTrabalhosListComponent {
  @Input() artigos: RevistaArtigo[] = [];
  @Input() canEdit = false;
  @Input() startIndex = 0;
  @Output() excluir = new EventEmitter<RevistaArtigo>();

  private readonly resumosAbertos = new Set<number>();

  aberto(id: number): boolean {
    return this.resumosAbertos.has(id);
  }

  alternarResumo(id: number): void {
    if (this.resumosAbertos.has(id)) this.resumosAbertos.delete(id);
    else this.resumosAbertos.add(id);
  }

  pdfDe(artigo: RevistaArtigo): string | null {
    return extrairLinkPdf(artigo.content);
  }

  trackById(_: number, artigo: RevistaArtigo): number {
    return artigo.id;
  }
}
