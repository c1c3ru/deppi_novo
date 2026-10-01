import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnaisService } from '../../services/anais.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UploadService } from '../../../../core/services/upload.service';
import { EDITAL_URL_PATTERN } from '../../anais.utils';

@Component({
  standalone: false,
  selector: 'app-anais-edicao-form',
  template: `
    <div class="edicao-form-page animate-in">
      <div class="header-container">
        <button class="btn-back" (click)="goBack()">&larr; Voltar</button>
        <div class="title-wrapper">
          <span class="badge">{{ isEditMode ? 'Edição' : 'Criação' }}</span>
          <h1 class="page-title">
            {{ isEditMode ? 'Editar Edição' : 'Nova Edição' }}
          </h1>
        </div>
      </div>

      <div class="loading-state" *ngIf="loadingInit">
        <div class="spinner"></div>
        <p>Carregando dados da edição...</p>
      </div>

      <form
        *ngIf="!loadingInit"
        [formGroup]="edicaoForm"
        class="form-container surface"
        (ngSubmit)="onSubmit('published')"
      >
        <div class="form-content">
          <div class="form-row">
            <div class="form-group">
              <label for="volume">Volume <span class="required">*</span></label>
              <input
                id="volume"
                type="number"
                min="1"
                class="input-modern"
                formControlName="volume"
              />
            </div>
            <div class="form-group">
              <label for="ano">Ano civil <span class="required">*</span></label>
              <input
                id="ano"
                type="number"
                min="2000"
                class="input-modern"
                formControlName="ano"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="title"
              >Título da edição <span class="required">*</span></label
            >
            <input
              id="title"
              type="text"
              class="input-modern"
              formControlName="title"
              placeholder="Ex: Anais da Mostra Científica - Volume 1"
            />
          </div>

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea
              id="description"
              class="input-modern"
              rows="3"
              formControlName="description"
              placeholder="Breve descrição desta edição..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="editalUrl">Edital da edição</label>
            <input
              id="editalUrl"
              type="text"
              inputmode="url"
              class="input-modern"
              formControlName="editalUrl"
              placeholder="https://... ou envie o PDF abaixo"
            />
            <input
              id="editalPdf"
              type="file"
              accept="application/pdf,.pdf"
              class="input-modern input-file"
              aria-label="Enviar PDF do edital"
              [disabled]="enviandoEdital"
              (change)="anexarEdital($event)"
            />
            <small class="hint" *ngIf="enviandoEdital">Enviando PDF...</small>
            <small class="hint" *ngIf="!enviandoEdital && editalAtual">
              Edital atual:
              <a [href]="editalAtual" target="_blank" rel="noopener"
                >abrir arquivo</a
              >. Enviar outro PDF substitui o link.
            </small>
            <small class="hint" *ngIf="!enviandoEdital && !editalAtual">
              Opcional. Cole o link do edital ou envie o PDF; ele aparece em
              "Documentos da edição".
            </small>
            <small
              class="hint erro"
              *ngIf="edicaoForm.get('editalUrl')?.invalid"
            >
              Use um endereço começando com http:// ou https://.
            </small>
          </div>
        </div>

        <div class="form-actions glass">
          <button
            type="button"
            class="btn btn-glass"
            (click)="onSubmit('draft')"
            [disabled]="loading || edicaoForm.invalid"
          >
            {{
              loading && actionType === 'draft'
                ? 'Salvando...'
                : 'Salvar Rascunho'
            }}
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="loading || edicaoForm.invalid"
          >
            {{
              loading && actionType === 'published'
                ? 'Publicando...'
                : isEditMode
                  ? 'Salvar e Publicar'
                  : 'Criar e Publicar'
            }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .edicao-form-page {
        max-width: 800px;
        margin: 0 auto;
      }

      .header-container {
        margin-bottom: 2.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
        align-items: flex-start;
      }

      .btn-back {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        font-weight: 600;
        font-size: 0.9rem;
        padding: 0;
      }

      .btn-back:hover {
        color: var(--color-primary);
      }

      .title-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .page-title {
        font-size: clamp(1.6rem, 4vw, 2.2rem);
        margin: 0;
      }

      .loading-state {
        text-align: center;
        padding: 4rem 0;
        color: var(--color-text-secondary);
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 3px solid var(--color-background-secondary);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1.5rem;
      }

      .form-container {
        padding: 0;
        overflow: hidden;
      }

      .form-content {
        padding: 2.5rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .form-group {
        margin-bottom: 1.8rem;
      }

      .form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--color-text);
      }

      .required {
        color: var(--color-error);
        margin-left: 0.2rem;
      }

      .input-modern {
        width: 100%;
        background: var(--color-background);
        border: 2px solid var(--color-border);
        border-radius: var(--border-radius-md);
        padding: 0.9rem 1.1rem;
        font-size: 1rem;
        font-family: inherit;
        color: var(--color-text);
        transition: all var(--transition-fast);
      }

      .input-modern:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
      }

      .input-file {
        margin-top: 0.6rem;
        padding: 0.6rem 0.8rem;
        font-size: 0.9rem;
      }

      .hint {
        display: block;
        margin-top: 0.4rem;
        font-size: 0.8rem;
        color: var(--color-text-muted);
      }

      .hint a {
        color: var(--color-primary-dark);
        font-weight: 700;
      }

      .hint.erro {
        color: var(--color-error-text);
      }

      textarea.input-modern {
        resize: vertical;
        min-height: 90px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1.2rem;
        padding: 1.5rem 2.5rem;
        border-top: 1px solid var(--color-border-light);
      }

      @media (max-width: 640px) {
        .form-row {
          grid-template-columns: 1fr;
        }
        .form-content {
          padding: 1.5rem;
        }
        .form-actions {
          padding: 1.2rem 1.5rem;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class AnaisEdicaoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly anaisService = inject(AnaisService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly uploadService = inject(UploadService);

  edicaoForm!: FormGroup;
  isEditMode = false;
  edicaoId: number | null = null;
  loadingInit = false;
  loading = false;
  actionType: 'draft' | 'published' = 'published';
  enviandoEdital = false;

  get editalAtual(): string | null {
    const url = (this.edicaoForm?.value?.editalUrl ?? '').trim();
    return url && EDITAL_URL_PATTERN.test(url) ? url : null;
  }

  ngOnInit(): void {
    this.edicaoForm = this.fb.group({
      volume: [1, [Validators.required, Validators.min(1)]],
      ano: [
        new Date().getFullYear(),
        [Validators.required, Validators.min(2000)],
      ],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      editalUrl: ['', [Validators.pattern(EDITAL_URL_PATTERN)]],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.edicaoId = +idParam;
        this.loadEdicao(this.edicaoId);
      }
    });
  }

  private loadEdicao(id: number): void {
    this.loadingInit = true;
    this.anaisService.getEdicaoById(id).subscribe({
      next: (edicao) => {
        this.edicaoForm.patchValue({
          volume: edicao.volume,
          ano: edicao.ano,
          title: edicao.title,
          description: edicao.description,
          editalUrl: edicao.editalUrl ?? '',
        });
        this.loadingInit = false;
      },
      error: () => {
        this.notificationService.showError(
          'Não foi possível carregar a edição.'
        );
        this.router.navigate(['/anais/edicoes']);
      },
    });
  }

  onSubmit(status: 'draft' | 'published'): void {
    if (this.edicaoForm.invalid) {
      this.edicaoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.actionType = status;

    const formData = { ...this.edicaoForm.value, status };

    const handler = {
      next: (res: any) => {
        this.notificationService.showSuccess(
          status === 'published' ? 'Edição publicada!' : 'Rascunho salvo!'
        );
        const targetId = this.isEditMode ? this.edicaoId : res?.id;
        this.router.navigate(['/anais/edicoes', targetId]);
      },
      error: (err: any) => {
        this.notificationService.showError(
          err.error?.error || 'Erro ao salvar a edição.'
        );
        this.loading = false;
      },
    };

    if (this.isEditMode && this.edicaoId) {
      this.anaisService.updateEdicao(this.edicaoId, formData).subscribe({
        next: () => handler.next({ id: this.edicaoId }),
        error: handler.error,
      });
    } else {
      this.anaisService.createEdicao(formData).subscribe(handler);
    }
  }

  anexarEdital(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) {
      this.notificationService.showError('Envie o edital em PDF.');
      input.value = '';
      return;
    }
    this.enviandoEdital = true;
    this.uploadService.uploadFile(file).subscribe({
      next: (anexo) => {
        this.edicaoForm.patchValue({ editalUrl: anexo.url });
        this.notificationService.showSuccess('Edital anexado à edição.');
        this.enviandoEdital = false;
        input.value = '';
      },
      error: () => {
        this.notificationService.showError('Não foi possível enviar o edital.');
        this.enviandoEdital = false;
        input.value = '';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/anais/edicoes']);
  }
}
