import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BoletinsService } from '../../services/boletins.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PartialObserver } from 'rxjs';
import { Boletim } from '../../../../shared/models';

@Component({
  selector: 'app-boletim-form',
  standalone: false,
  template: `
    <div class="boletim-form-page animate-in">
      <div class="header-container">
        <button class="btn-back" (click)="goBack()">
          <span class="icon">&larr;</span> Voltar
        </button>
        <div class="title-wrapper">
          <span class="badge">{{ isEditMode ? 'Edição' : 'Criação' }}</span>
          <h1 class="page-title">
            {{ isEditMode ? 'Editar Boletim' : 'Novo Boletim' }}
          </h1>
        </div>
      </div>

      <div class="loading-state" *ngIf="loadingInit">
        <div class="spinner"></div>
        <p>Carregando dados do boletim...</p>
      </div>

      <form
        *ngIf="!loadingInit"
        [formGroup]="boletimForm"
        class="form-container surface"
        (ngSubmit)="onSubmit('published')"
      >
        <div class="form-content">
          <div class="form-group main-inputs">
            <label for="title"
              >Título do Boletim <span class="required">*</span></label
            >
            <input
              id="title"
              type="text"
              class="input-modern"
              formControlName="title"
              placeholder="Ex: Resultados do Primeiro Semestre"
              [class.error]="
                boletimForm.get('title')?.invalid &&
                boletimForm.get('title')?.touched
              "
            />
            <span
              class="error-message"
              *ngIf="
                boletimForm.get('title')?.errors?.['required'] &&
                boletimForm.get('title')?.touched
              "
              >O título é obrigatório.</span
            >
          </div>

          <div class="form-group main-inputs">
            <label for="description"
              >Breve Descrição <span class="required">*</span></label
            >
            <textarea
              id="description"
              class="input-modern"
              rows="3"
              formControlName="description"
              placeholder="Resumo que aparecerá no card principal..."
              [class.error]="
                boletimForm.get('description')?.invalid &&
                boletimForm.get('description')?.touched
              "
            ></textarea>
            <span
              class="error-message"
              *ngIf="
                boletimForm.get('description')?.errors?.['required'] &&
                boletimForm.get('description')?.touched
              "
              >A descrição é obrigatória.</span
            >
          </div>

          <div class="form-group editor-group">
            <label>Conteúdo Principal <span class="required">*</span></label>
            <p class="help-text">
              Utilize o editor abaixo para formatar o texto, adicionar imagens e
              inserir vídeos.
            </p>
            <div
              class="quill-wrapper"
              [class.error]="
                boletimForm.get('content')?.invalid &&
                boletimForm.get('content')?.touched
              "
            >
              <quill-editor
                formControlName="content"
                [styles]="{
                  height: '450px',
                  'background-color': 'var(--color-surface)',
                  'border-radius':
                    '0 0 var(--border-radius-md) var(--border-radius-md)',
                  color: 'var(--color-text)',
                }"
                [modules]="quillModules"
                (onEditorCreated)="onEditorCreated($event)"
                placeholder="Escreva o conteúdo completo do seu boletim aqui..."
              >
              </quill-editor>
            </div>
            <span
              class="error-message"
              *ngIf="
                boletimForm.get('content')?.errors?.['required'] &&
                boletimForm.get('content')?.touched
              "
              >O conteúdo não pode estar vazio.</span
            >
          </div>

          <div class="form-group checkbox-group">
            <label class="custom-checkbox">
              <input type="checkbox" formControlName="isFeatured" />
              <span class="checkmark"></span>
              Destacar este boletim na listagem principal
            </label>
          </div>
        </div>

        <div class="form-actions glass">
          <button
            type="button"
            class="btn btn-glass"
            (click)="onSubmit('draft')"
            [disabled]="loading || boletimForm.invalid"
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
            [disabled]="loading || boletimForm.invalid"
          >
            <span class="icon">🚀</span>
            {{
              loading && actionType === 'published'
                ? 'Publicando...'
                : isEditMode
                  ? 'Salvar e Publicar'
                  : 'Salvar e Postar'
            }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .boletim-form-page {
        padding: 0 1rem;
        max-width: 900px;
        margin: 0 auto;
        padding-bottom: 5rem;
      }

      .header-container {
        margin-bottom: 3rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .btn-back {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0;
        transition: color var(--transition-fast);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .btn-back:hover {
        color: var(--color-primary);
      }

      .title-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .badge {
        align-self: flex-start;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding: 0.4rem 1rem;
        background: rgba(var(--color-primary-rgb), 0.1);
        color: var(--color-primary);
        border-radius: var(--border-radius-full);
      }

      .page-title {
        font-size: clamp(2rem, 4vw, 2.5rem);
        margin: 0;
      }

      .loading-state {
        text-align: center;
        padding: 5rem 0;
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
        padding: 3rem;
      }

      .form-group {
        margin-bottom: 2rem;
      }

      .form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        font-size: 1.05rem;
        color: var(--color-text);
      }

      .required {
        color: var(--color-error);
        margin-left: 0.2rem;
      }

      .help-text {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        margin-top: -0.3rem;
        margin-bottom: 1rem;
      }

      .input-modern {
        width: 100%;
        background: var(--color-background);
        border: 2px solid var(--color-border);
        border-radius: var(--border-radius-md);
        padding: 1rem 1.2rem;
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

      .input-modern.error {
        border-color: var(--color-error);
      }

      .input-modern::-webkit-input-placeholder {
        color: var(--color-text-muted);
      }

      textarea.input-modern {
        resize: vertical;
        min-height: 100px;
      }

      .error-message {
        display: block;
        color: var(--color-error);
        font-size: 0.85rem;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .quill-wrapper {
        border: 2px solid var(--color-border);
        border-radius: var(--border-radius-md);
        transition: border-color var(--transition-fast);
      }

      .quill-wrapper:focus-within {
        border-color: var(--color-primary);
      }

      .quill-wrapper.error {
        border-color: var(--color-error);
      }

      /* Custom Quill Theme fixes for Dark Mode if needed */
      ::ng-deep .ql-toolbar {
        border: none !important;
        border-bottom: 2px solid var(--color-border) !important;
        background: var(--color-background) !important;
        border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
        padding: 12px 8px !important;
      }
      ::ng-deep .ql-container {
        border: none !important;
        background: var(--color-background-secondary);
        border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
      }
      ::ng-deep .ql-editor {
        font-family: var(--font-family) !important;
        font-size: 1rem !important;
        color: var(--color-text);
        line-height: 1.7;
      }

      .checkbox-group {
        margin-top: 3rem;
        margin-bottom: 1rem;
      }

      .custom-checkbox {
        display: block;
        position: relative;
        padding-left: 35px;
        margin-bottom: 12px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        user-select: none;
        color: var(--color-text);
      }

      .custom-checkbox input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }

      .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 24px;
        width: 24px;
        background-color: var(--color-background);
        border: 2px solid var(--color-border);
        border-radius: 6px;
        transition: all var(--transition-fast);
      }

      .custom-checkbox:hover input ~ .checkmark {
        border-color: var(--color-primary);
      }

      .custom-checkbox input:checked ~ .checkmark {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }

      .checkmark:after {
        content: '';
        position: absolute;
        display: none;
      }

      .custom-checkbox input:checked ~ .checkmark:after {
        display: block;
      }

      .custom-checkbox .checkmark:after {
        left: 7px;
        top: 3px;
        width: 6px;
        height: 12px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1.5rem;
        padding: 1.5rem 3rem;
        border-top: 1px solid var(--color-border-light);
        background: rgba(var(--color-surface-rgb), 0.5);
      }

      @media (max-width: 768px) {
        .form-content {
          padding: 1.5rem;
        }
        .form-actions {
          padding: 1.5rem;
          flex-direction: column;
        }
        .form-actions button {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
})
export class BoletimFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly boletinsService = inject(BoletinsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  boletimForm!: FormGroup;
  isEditMode = false;
  boletimId: number | null = null;
  loadingInit = false;
  loading = false;
  actionType: 'draft' | 'published' = 'published';

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.boletimForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required]],
      isFeatured: [false],
    });
  }

  private checkEditMode(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.boletimId = +idParam;
        this.loadBoletim(this.boletimId);
      }
    });
  }

  private pendingContent = '';
  private editorInstance: any;

  onEditorCreated(editor: any): void {
    this.editorInstance = editor;
    if (this.pendingContent) {
      this.editorInstance.clipboard.dangerouslyPasteHTML(this.pendingContent);
      this.boletimForm.patchValue({ content: this.pendingContent });
      this.pendingContent = '';
    }
  }

  private loadBoletim(id: number): void {
    this.loadingInit = true;
    this.boletinsService.getById(id).subscribe({
      next: (boletim) => {
        this.loadingInit = false;

        if (this.editorInstance) {
          this.editorInstance.clipboard.dangerouslyPasteHTML(
            boletim.content || ''
          );
        } else {
          this.pendingContent = boletim.content || '';
        }

        setTimeout(() => {
          this.boletimForm.patchValue({
            title: boletim.title,
            description: boletim.description,
            content: boletim.content || '',
            isFeatured: boletim.isFeatured,
          });
        }, 0);
      },
      error: () => {
        this.notificationService.showError(
          'Não foi possível carregar o boletim. Verifique se ele existe.'
        );
        this.router.navigate(['/boletins']);
      },
    });
  }

  onSubmit(status: 'draft' | 'published'): void {
    if (this.boletimForm.invalid) {
      this.boletimForm.markAllAsTouched();
      this.notificationService.showError(
        'Por favor, preencha todos os campos obrigatórios.'
      );
      return;
    }

    this.loading = true;
    this.actionType = status;

    const formData = {
      ...this.boletimForm.value,
      status,
    };

    const handler = {
      next: () => {
        const msg =
          status === 'published'
            ? 'Boletim publicado com sucesso!'
            : 'Rascunho salvo com sucesso!';
        this.notificationService.showSuccess(msg);
        this.router.navigate(['/boletins']);
      },
      error: () => {
        this.notificationService.showError(
          'Houve um erro ao processar sua solicitação.'
        );
        this.loading = false;
      },
    };

    if (this.isEditMode && this.boletimId) {
      this.boletinsService.update(this.boletimId, formData).subscribe(handler);
    } else {
      this.boletinsService.create(formData).subscribe(handler);
    }
  }

  goBack(): void {
    this.router.navigate(['/boletins']);
  }
}
