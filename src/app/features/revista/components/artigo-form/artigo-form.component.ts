import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RevistaService } from '../../services/revista.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  standalone: false,
  selector: 'app-revista-artigo-form',
  template: `
    <div class="artigo-form-page animate-in">
      <div class="header-container">
        <button class="btn-back" (click)="goBack()">&larr; Voltar</button>
        <div class="title-wrapper">
          <span class="badge">{{ isEditMode ? 'Edição' : 'Criação' }}</span>
          <h1 class="page-title">
            {{ isEditMode ? 'Editar Artigo' : 'Novo Artigo' }}
          </h1>
        </div>
      </div>

      <div class="loading-state" *ngIf="loadingInit">
        <div class="spinner"></div>
        <p>Carregando dados do artigo...</p>
      </div>

      <form
        *ngIf="!loadingInit"
        [formGroup]="artigoForm"
        class="form-container surface"
        (ngSubmit)="onSubmit()"
      >
        <div class="form-content">
          <div class="form-group">
            <label for="title">Título do artigo <span class="required">*</span></label>
            <input
              id="title"
              type="text"
              class="input-modern"
              formControlName="title"
            />
          </div>

          <div class="form-group">
            <label for="authors">Autores</label>
            <input
              id="authors"
              type="text"
              class="input-modern"
              formControlName="authors"
              placeholder="Ex: Nome Sobrenome, Nome Sobrenome"
            />
          </div>

          <div class="form-group">
            <label for="summary">Resumo</label>
            <textarea
              id="summary"
              class="input-modern"
              rows="3"
              formControlName="summary"
            ></textarea>
          </div>

          <div class="form-group editor-group">
            <label>Conteúdo do artigo <span class="required">*</span></label>
            <div class="quill-wrapper">
              <quill-editor
                *ngIf="quillReady"
                formControlName="content"
                [styles]="{
                  height: '450px',
                  'background-color': 'var(--color-surface)',
                  color: 'var(--color-text)',
                }"
                [modules]="quillModules"
                (onEditorCreated)="onEditorCreated($event)"
                placeholder="Escreva o conteúdo completo do artigo aqui..."
              >
              </quill-editor>
              <div *ngIf="!quillReady" class="editor-placeholder">
                <p>Preparando editor de texto...</p>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="order">Ordem de exibição</label>
            <input
              id="order"
              type="number"
              min="0"
              class="input-modern"
              formControlName="order"
            />
          </div>
        </div>

        <div class="form-actions glass">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="loading || artigoForm.invalid"
          >
            {{ loading ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Publicar Artigo' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .artigo-form-page {
        max-width: 900px;
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

      textarea.input-modern {
        resize: vertical;
        min-height: 90px;
      }

      .quill-wrapper {
        border: 2px solid var(--color-border);
        border-radius: var(--border-radius-md);
      }

      ::ng-deep .artigo-form-page .ql-toolbar {
        border: none !important;
        border-bottom: 2px solid var(--color-border) !important;
        background: var(--color-background) !important;
        border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
      }
      ::ng-deep .artigo-form-page .ql-container {
        border: none !important;
        background: var(--color-background-secondary);
        border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
      }
      ::ng-deep .artigo-form-page .ql-editor {
        color: var(--color-text);
        line-height: 1.7;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        padding: 1.5rem 2.5rem;
        border-top: 1px solid var(--color-border-light);
      }

      @media (max-width: 640px) {
        .form-content {
          padding: 1.5rem;
        }
        .form-actions {
          padding: 1.2rem 1.5rem;
        }
      }
    `,
  ],
})
export class RevistaArtigoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly revistaService = inject(RevistaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  artigoForm!: FormGroup;
  isEditMode = false;
  artigoId: number | null = null;
  edicaoId: number | null = null;
  loadingInit = false;
  loading = false;
  quillReady = false;

  private pendingContent = '';
  private editorInstance: any;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  constructor() {
    if (typeof window !== 'undefined') {
      import('quill')
        .then((quillModule) => {
          const actualQuill: any = quillModule.default || quillModule;
          (window as any).Quill = actualQuill;
          this.quillReady = true;
        })
        .catch(() => {
          this.quillReady = true;
        });
    }
  }

  ngOnInit(): void {
    this.artigoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      authors: [''],
      summary: [''],
      content: ['', [Validators.required]],
      order: [0],
    });

    this.route.paramMap.subscribe((params) => {
      const edicaoIdParam = params.get('edicaoId');
      const artigoIdParam = params.get('id');

      if (edicaoIdParam) {
        this.edicaoId = +edicaoIdParam;
      }

      if (artigoIdParam) {
        this.isEditMode = true;
        this.artigoId = +artigoIdParam;
        this.loadArtigo(this.artigoId);
      }
    });
  }

  onEditorCreated(editor: any): void {
    this.editorInstance = editor;
    if (this.pendingContent) {
      this.editorInstance.clipboard.dangerouslyPasteHTML(this.pendingContent);
      this.artigoForm.patchValue({ content: this.pendingContent });
      this.pendingContent = '';
    }
  }

  private loadArtigo(id: number): void {
    this.loadingInit = true;
    this.revistaService.getArtigoById(id).subscribe({
      next: (artigo) => {
        this.edicaoId = artigo.edicaoId;

        if (this.editorInstance) {
          this.editorInstance.clipboard.dangerouslyPasteHTML(artigo.content || '');
        } else {
          this.pendingContent = artigo.content || '';
        }

        setTimeout(() => {
          this.artigoForm.patchValue({
            title: artigo.title,
            authors: artigo.authors,
            summary: artigo.summary,
            content: artigo.content || '',
            order: artigo.order,
          });
        }, 0);
        this.loadingInit = false;
      },
      error: () => {
        this.notificationService.showError('Não foi possível carregar o artigo.');
        this.goBack();
      },
    });
  }

  onSubmit(): void {
    if (this.artigoForm.invalid || !this.edicaoId) {
      this.artigoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.artigoForm.value;

    const handler = {
      next: (res: any) => {
        this.notificationService.showSuccess('Artigo salvo com sucesso!');
        const targetId = this.isEditMode ? this.artigoId : res?.id;
        this.router.navigate(['/revista/artigos', targetId]);
      },
      error: (err: any) => {
        this.notificationService.showError(
          err.error?.error || 'Erro ao salvar o artigo.'
        );
        this.loading = false;
      },
    };

    if (this.isEditMode && this.artigoId) {
      this.revistaService.updateArtigo(this.artigoId, formData).subscribe({
        next: () => handler.next({ id: this.artigoId }),
        error: handler.error,
      });
    } else {
      this.revistaService.createArtigo(this.edicaoId, formData).subscribe(handler);
    }
  }

  goBack(): void {
    if (this.edicaoId) {
      this.router.navigate(['/revista/edicoes', this.edicaoId]);
    } else {
      this.router.navigate(['/revista/edicoes']);
    }
  }
}
