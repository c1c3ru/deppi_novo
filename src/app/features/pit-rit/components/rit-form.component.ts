import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { PitRitService, RitData } from '../services/pit-rit.service';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../../core/services/notification.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-rit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    TranslateModule,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rit-form-container glass-card animate-fade-in">
      <div class="form-section">
        <div class="alert-info">
          <h4 style="margin-bottom: 8px; color: #0066b3;">
            Orientações para preenchimento do RIT
          </h4>
          <ol
            style="margin-left: 20px; font-size: 0.9rem; line-height: 1.5; color: #444;"
          >
            <li>
              A carga horária (C.H.) deve ser contabilizada em horas de 60
              minutos.
            </li>
            <li>
              A C.H deve constar o subtotal de horas obtidas para cada atividade
              registrada de acordo com o obtido na Tabela de Carga Horária
              docente.
            </li>
            <li>
              Com exceção da carga horária de ensino dedicada a aulas (que serão
              acompanhadas através do sistema Acadêmico).
            </li>
            <li>
              O RIT deve ser entregue às Direções ou Departamentos de Ensino em
              até 30 (trinta) dias após o final do semestre letivo anterior.
            </li>
            <li>
              No caso de não apresentação do RIT no prazo, subentende-se que o
              docente realizou exclusivamente atividades de ensino no IFCE.
            </li>
            <li>
              O RIT deve ser preenchido respeitando os critérios estabelecidos
              na Resolução de Carga Horária Docente do IFCE.
            </li>
          </ol>
        </div>
      </div>

      <header class="form-header">
        <h2 class="section-title">Formulário RIT</h2>
        <p class="section-desc">
          Relatório Individual de Trabalho - Atividades desenvolvidas no
          semestre.
        </p>
      </header>

      <form #ritForm="ngForm" class="modern-form">
        <!-- IDENTIFICAÇÃO -->
        <div class="form-section">
          <h3 class="subsection-title">Identificação do Servidor</h3>
          <div class="grid-form">
            <div
              class="form-group"
              [class.has-error]="ritForm.submitted && !data.identificacao.nome"
            >
              <label>Nome Completo *</label>
              <input
                type="text"
                [(ngModel)]="data.identificacao.nome"
                name="nome"
                #nome="ngModel"
                required
                (change)="update()"
                class="form-input"
              />
              <span class="error-msg" *ngIf="ritForm.submitted && nome.invalid"
                >Nome é obrigatório</span
              >
            </div>
            <div class="form-group">
              <label>Siape</label>
              <input
                type="text"
                [(ngModel)]="data.identificacao.siape"
                name="siape"
                mask="0000000 || 00000000"
                (change)="update()"
                placeholder="Número Siape"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Campus</label>
              <input
                type="text"
                [(ngModel)]="data.identificacao.campus"
                name="campus"
                placeholder="Ex: Maracanaú"
                (change)="update()"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Curso / Coordenadoria</label>
              <input
                type="text"
                [(ngModel)]="data.identificacao.curso"
                name="curso"
                placeholder="Ex: Telemática"
                (change)="update()"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Vínculo</label>
              <select
                [(ngModel)]="data.identificacao.vinculo"
                name="vinculo"
                (change)="update()"
                class="form-select"
              >
                <option value="Efetivo">Efetivo</option>
                <option value="Dedicação Exclusiva (D.E.)">Dedicação Exclusiva (D.E.)</option>
                <option value="Substituto">Substituto</option>
                <option value="Temporário">Temporário</option>
                <option value="Colaborador">Colaborador</option>
              </select>
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input
                type="text"
                [(ngModel)]="data.identificacao.telefone"
                name="tel"
                mask="(00) 0 0000-0000 || (00) 0000-0000"
                (change)="update()"
                placeholder="(00) 00000-0000"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>E-mail</label>
              <input
                type="email"
                [(ngModel)]="data.identificacao.email"
                name="email"
                (change)="update()"
                placeholder="exemplo@ifce.edu.br"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Regime</label>
              <select
                [(ngModel)]="data.identificacao.regime"
                name="regime"
                (change)="update()"
                class="form-select"
              >
                <option value="40h D.E.">40h D.E.</option>
                <option value="40h">40h</option>
                <option value="30h">30h</option>
                <option value="20h">20h</option>
              </select>
            </div>
            <div class="form-group">
              <label>Semestre Letivo *</label>
              <input
                type="text"
                [(ngModel)]="data.semestre"
                name="semestre"
                #sem="ngModel"
                required
                mask="0000.0"
                (change)="update()"
                placeholder="2024.1"
                class="form-input"
              />
              <span class="error-msg" *ngIf="ritForm.submitted && sem.invalid"
                >Semestre inválido</span
              >
            </div>
          </div>
        </div>

        <!-- RELATÓRIOS NARRATIVOS -->
        <div class="form-section">
          <h3 class="subsection-title">Atividades Desenvolvidas</h3>

          <div class="report-grid">
            <div class="report-item">
              <label>Atividades de Ensino</label>
              <p class="field-help">
                Disciplinas ministradas, orientações concluídas, atendimento ao
                aluno...
              </p>
              <textarea
                [(ngModel)]="data.relatorios.ensino"
                name="rel_ensino"
                (change)="update()"
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="report-item">
              <label>Atividades de Pesquisa Aplicada</label>
              <p class="field-help">
                Andamento dos projetos, cronograma e atividades desenvolvidas.
              </p>
              <textarea
                [(ngModel)]="data.relatorios.pesquisa"
                name="rel_pesquisa"
                (change)="update()"
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="report-item">
              <label>Atividades de Extensão</label>
              <p class="field-help">
                Projetos de extensão, programas e impacto na comunidade.
              </p>
              <textarea
                [(ngModel)]="data.relatorios.extensao"
                name="rel_extensao"
                (change)="update()"
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="report-item">
              <label>Atividades de Gestão / Comissões</label>
              <p class="field-help">
                Atividades institucionais, coordenação, fiscalização e
                comissões.
              </p>
              <textarea
                [(ngModel)]="data.relatorios.gestao"
                name="rel_gestao"
                (change)="update()"
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="report-item">
              <label>Atividades de Capacitação</label>
              <p class="field-help">
                Cursos, treinamentos e especializações realizadas.
              </p>
              <textarea
                [(ngModel)]="data.relatorios.capacitacao"
                name="rel_capacitacao"
                (change)="update()"
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="reset()">
            Limpar
          </button>
          <button type="button" class="btn-primary" (click)="generate()">
            Gerar Relatório RIT
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        --slot-bg-Aula: #e8f5e9;
        --slot-color-Aula: #2e7d32;
        --slot-bg-Planejamento: #fff3e0;
        --slot-color-Planejamento: #e65100;
        --slot-bg-Atendimento: #e3f2fd;
        --slot-color-Atendimento: #1565c0;
        --slot-bg-Apoio: #f3e5f5;
        --slot-color-Apoio: #6a1b9a;
        --slot-bg-Orientação: #fce4ec;
        --slot-color-Orientação: #ad1457;
        --slot-bg-Extracurricular: #eceff1;
        --slot-color-Extracurricular: #37474f;
        --slot-bg-Pesquisa: #e0f2f1;
        --slot-color-Pesquisa: #00695c;
        --slot-bg-Extensão: #fbe9e7;
        --slot-color-Extensão: #d84315;
        --slot-bg-Gestão: #e8eaf6;
        --slot-color-Gestão: #283593;
        --slot-bg-Comissões: #fff8e1;
        --slot-color-Comissões: #ff8f00;
      }
      .rit-form-container {
        padding: 2.5rem;
        max-width: 1000px;
        margin: 2rem auto;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      .alert-info {
        background: #e3f2fd;
        padding: 1.5rem;
        border-left: 4px solid #1565c0;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
      .form-header {
        margin-bottom: 2.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        padding-bottom: 1.5rem;
      }
      .section-title {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 0.5rem;
      }
      .section-desc {
        color: var(--color-text-secondary);
        font-size: 0.95rem;
      }

      .form-section {
        margin-bottom: 3.5rem;
      }
      .subsection-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .subsection-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--color-border);
      }

      .grid-form {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
      .report-grid {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
      .report-item label {
        display: block;
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: var(--color-text) !important;
        font-size: 1rem;
      }
      .field-help {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.75rem;
      }

      .form-input,
      .form-select,
      .form-textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid var(--color-border);
        border-radius: 8px;
        font-size: 0.95rem;
        /* Apenas border-color na transition para evitar re-layout e flickering */
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        background: var(--color-background-secondary);
        color: var(--color-text);
      }
      .form-input,
      .form-textarea {
        cursor: text;
      }
      .form-select {
        cursor: pointer;
      }
      .form-textarea {
        resize: vertical;
        min-height: 100px;
      }
      .form-input::placeholder {
        color: var(--color-text-muted);
      }


      .form-group.has-error .form-input {
        border-color: var(--color-error);
      }
      .error-msg {
        font-size: 0.75rem;
        color: var(--color-error);
        font-weight: 500;
        margin-top: 2px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
      }
      .btn-primary {
        background: var(--color-primary);
        color: white;
        border: none;
        padding: 0.8rem 2.5rem;
        border-radius: 50px;
        font-weight: 600;
        cursor: pointer !important;
        transition: all 0.2s;
      }
      .btn-secondary {
        background: var(--color-background-secondary);
        color: var(--color-text-secondary);
        border: 1px solid var(--color-border);
        padding: 0.8rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        cursor: pointer !important;
      }
      .btn-primary *, .btn-secondary * {
        pointer-events: none;
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-primary);
        background: var(--color-primary-dark);
      }

      @media (max-width: 600px) {
        .grid-form {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class RitFormComponent {
  private pitRitService = inject(PitRitService);
  private pdfService = inject(PdfGeneratorService);
  private notificationService = inject(NotificationService);
  private cd = inject(ChangeDetectorRef);

  data!: RitData;

  constructor() {
    this.pitRitService.currentRitData$.subscribe((d) => {
      this.data = JSON.parse(JSON.stringify(d));
      this.cd.markForCheck();
    });
  }

  update() {
    this.pitRitService.updateRitData(this.data);
  }

  reset() {
    this.pitRitService.resetRit();
    this.notificationService.showInfo('Formulário RIT limpo.');
  }

  generate() {
    if (!this.data.identificacao.nome) {
      this.notificationService.showError(
        'Preencha pelo menos o seu nome para gerar o PDF.'
      );
      return;
    }
    this.pdfService.generateRitPdf(this.data);
    this.notificationService.showSuccess('PDF do RIT gerado com sucesso!');
  }
}
