import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { PitRitService } from '../services/pit-rit.service';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../../core/services/notification.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { PitTableRow, PIT_SHEET_DATA } from '../constants/pit.constants';

@Component({
  selector: 'app-pit-form',
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
    <div class="pit-form-container glass-card animate-fade-in">
      <header class="form-header">
        <h2 class="section-title">Formulário PIT</h2>
        <p class="section-desc">
          Preencha as informações para gerar seu Plano Individual de Trabalho.
        </p>
      </header>

      <form #pitForm="ngForm" class="modern-form">
        <!-- IDENTIFICAÇÃO -->
        <div class="form-section">
          <h3 class="subsection-title">Identificação do Servidor</h3>
          <div class="grid-form">
            <div
              class="form-group"
              [class.has-error]="pitForm.submitted && !data.identificacao.nome"
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
              <span class="error-msg" *ngIf="pitForm.submitted && nome.invalid"
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
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Regime de Trabalho</label>
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
              <label>Semestre *</label>
              <input
                type="text"
                [(ngModel)]="data.semestre"
                name="semestre"
                mask="0000.0"
                #sem="ngModel"
                required
                (change)="update()"
                class="form-input"
              />
              <span class="error-msg" *ngIf="pitForm.submitted && sem.invalid"
                >Semestre inválido</span
              >
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="subsection-title">Tabela de Carga Horária Docente</h3>
          <div class="table-responsive">
            <table class="spreadsheet-table">
              <thead>
                <tr>
                  <th width="50%">Atividades</th>
                  <th width="8%">Peso</th>
                  <th width="8%">Max</th>
                  <th width="14%">Unidade</th>
                  <th width="10%">Quantidade</th>
                  <th width="10%">CH Obtidas</th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let sec of sheetData">
                  <tr class="section-row">
                    <td colspan="6">{{ sec.title }}</td>
                  </tr>
                  <tr
                    *ngFor="let row of sec.rows"
                    [class.subtotal-row]="row.isSubtotal"
                  >
                    <ng-container *ngIf="!row.isSubtotal">
                      <td class="desc-cell">{{ row.code }} {{ row.desc }}</td>
                      <td class="text-center">{{ row.peso }}</td>
                      <td class="text-center">{{ row.max }}</td>
                      <td class="text-center">{{ row.unidade }}</td>
                      <td
                        class="input-cell"
                        [class.readonly-cell]="row.readonly"
                      >
                        <input
                          *ngIf="!row.readonly"
                          type="number"
                          min="0"
                          [ngModel]="getQValue(row.q)"
                          (ngModelChange)="setQValue(row.q, $event)"
                          [name]="row.q || ''"
                          class="table-input"
                        />
                        <span *ngIf="row.readonly">{{ getQValue(row.q) }}</span>
                      </td>
                      <td
                        class="text-center result-cell"
                        [class.calculated-val]="true"
                      >
                        {{ getTValue(row.t) | number: '1.1-1' }}
                      </td>
                    </ng-container>
                    <ng-container *ngIf="row.isSubtotal">
                      <td colspan="5" class="text-right fw-bold">Subtotal</td>
                      <td class="text-center subtotal-cell fw-bold">
                        {{ getSubtotal(sec) | number: '1.1-1' }}
                      </td>
                    </ng-container>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>
        </div>

        <div class="form-section">
          <div class="total-alert" [class.total-excedido]="getGrandTotal() > getMaxCH()">
            Carga Horária Total:
            <strong>{{ getGrandTotal() | number: '1.1-1' }}h</strong>
            <span class="total-max"> (Máximo {{ data.identificacao.regime || '40h D.E.' }}: {{ getMaxCH() }}h)</span>
            <span *ngIf="getGrandTotal() > getMaxCH()" class="total-aviso"> ⚠ CH excede o limite!</span>
          </div>
        </div>

        <!-- QUADRO DE HORÁRIOS -->
        <div class="form-section">
          <h3 class="subsection-title">
            Distribuição de Carga Horária (Semestre Atual)
          </h3>
          <div class="table-responsive">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Segunda</th>
                  <th>Terça</th>
                  <th>Quarta</th>
                  <th>Quinta</th>
                  <th>Sexta</th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let period of periods; let pid = index">
                  <tr *ngFor="let slot of slots; let sid = index">
                    <td
                      *ngIf="sid === 0"
                      [attr.rowspan]="slots.length"
                      class="period-cell"
                    >
                      {{ period }}
                    </td>
                    <td *ngFor="let day of days; let did = index">
                      <select
                        [(ngModel)]="
                          data.horarios[pid * slots.length + sid][did]
                        "
                        [name]="'h' + pid + sid + did"
                        (change)="update()"
                        class="slot-select"
                        [attr.data-activity]="
                          data.horarios[pid * slots.length + sid][did]
                        "
                      >
                        <option value="">--</option>
                        <option
                          *ngFor="let opt of activityOptions"
                          [value]="opt"
                        >
                          {{ opt }}
                        </option>
                      </select>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="reset()">
            Limpar
          </button>
          <button type="button" class="btn-primary" (click)="generate()">
            Visualizar Relatório
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
      .pit-form-container {
        padding: 2.5rem;
        max-width: 1200px;
        margin: 2rem auto;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        transform: translateZ(0); /* Estabilização de renderização */
        backface-visibility: hidden;
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
        margin-bottom: 3rem;
      }
      .subsection-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: 1.5rem;
      }
      .grid-form {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
      .form-group label {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text) !important;
        margin-bottom: 0.5rem;
        display: block;
      }
      .form-input {
        padding: 0.75rem 1rem;
        border: 2px solid var(--color-border);
        border-radius: 8px;
        font-size: 0.95rem;
        background: var(--color-background-secondary);
        color: var(--color-text);
        cursor: text;
        /* Sem transition no hover para evitar flickering entre estados */
        transition: border-color 0.2s ease;
      }
      .form-select {
        padding: 0.75rem 1rem;
        border: 2px solid var(--color-border);
        border-radius: 8px;
        font-size: 0.95rem;
        background: var(--color-background-secondary);
        color: var(--color-text);
        cursor: pointer;
        /* Sem transition que cause layout recalculation */
        transition: border-color 0.2s ease;
      }

      .spreadsheet-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        border: 1px solid var(--color-border);
      }
      .spreadsheet-table th,
      .spreadsheet-table td {
        border: 1px solid var(--color-border);
        padding: 0.5rem;
        font-size: 0.85rem;
      }
      .spreadsheet-table th {
        background: rgba(0, 0, 0, 0.05);
        text-align: center;
        color: var(--color-text);
        font-weight: bold;
      }
      .section-row td {
        background: rgba(0, 0, 0, 0.1);
        font-weight: bold;
        font-size: 0.9rem;
        text-align: left;
        color: var(--color-text);
      }
      .desc-cell {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }
      .text-center {
        text-align: center;
      }
      .text-right {
        text-align: right;
      }
      .fw-bold {
        font-weight: bold;
      }
      .input-cell {
        padding: 0 !important;
        background: rgba(var(--color-primary-rgb), 0.1);
        cursor: text;
      }
      .readonly-cell {
        background: rgba(0, 0, 0, 0.02);
        text-align: center;
        color: var(--color-text-muted);
        cursor: default;
      }
      .input-cell input {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        text-align: center;
        font-size: 0.85rem;
        font-weight: bold;
        color: var(--color-text);
        min-height: 28px;
        cursor: text;
      }
      .input-cell input:focus {
        outline: 2px solid #2e7d32;
      }
      .result-cell {
        background: rgba(var(--color-accent-rgb), 0.1);
        font-weight: bold;
        color: var(--color-text);
      }
      .subtotal-cell {
        background: rgba(var(--color-accent-rgb), 0.3);
        font-weight: bold;
        font-size: 0.95rem;
        color: var(--color-text);
      }

      .table-responsive {
        overflow-x: auto;
      }
      .schedule-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 4px;
      }
      .schedule-table th {
        padding: 0.75rem;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        font-weight: 600;
      }
      .period-cell {
        background: rgba(0, 0, 0, 0.05);
        font-weight: 700;
        font-size: 0.8rem;
        text-align: center;
        color: var(--color-primary);
        border-radius: 4px;
        cursor: default;
      }
      .slot-select {
        padding: 0.4rem;
        font-size: 0.8rem;
        height: 36px;
        width: 100%;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: background-color 0.3s;
        cursor: pointer;
      }
      .btn-primary, .btn-secondary {
        cursor: pointer !important;
      }
      .btn-primary *, .btn-secondary * {
        pointer-events: none;
      }
      .table-input {
        cursor: text;
      }
      .slot-select[data-activity='Aula'] {
        background-color: var(--slot-bg-Aula);
        color: var(--slot-color-Aula);
        border-color: var(--slot-color-Aula);
        font-weight: 600;
      }
      .slot-select[data-activity='Planejamento'] {
        background-color: var(--slot-bg-Planejamento);
        color: var(--slot-color-Planejamento);
        border-color: var(--slot-color-Planejamento);
        font-weight: 600;
      }
      .slot-select[data-activity='Atendimento'] {
        background-color: var(--slot-bg-Atendimento);
        color: var(--slot-color-Atendimento);
        border-color: var(--slot-color-Atendimento);
        font-weight: 600;
      }
      .slot-select[data-activity='Apoio'] {
        background-color: var(--slot-bg-Apoio);
        color: var(--slot-color-Apoio);
        border-color: var(--slot-color-Apoio);
        font-weight: 600;
      }
      .slot-select[data-activity='Orientação'] {
        background-color: var(--slot-bg-Orientação);
        color: var(--slot-color-Orientação);
        border-color: var(--slot-color-Orientação);
        font-weight: 600;
      }
      .slot-select[data-activity='Extracurricular'] {
        background-color: var(--slot-bg-Extracurricular);
        color: var(--slot-color-Extracurricular);
        border-color: var(--slot-color-Extracurricular);
        font-weight: 600;
      }
      .slot-select[data-activity='Pesquisa'] {
        background-color: var(--slot-bg-Pesquisa);
        color: var(--slot-color-Pesquisa);
        border-color: var(--slot-color-Pesquisa);
        font-weight: 600;
      }
      .slot-select[data-activity='Extensão'] {
        background-color: var(--slot-bg-Extensão);
        color: var(--slot-color-Extensão);
        border-color: var(--slot-color-Extensão);
        font-weight: 600;
      }
      .slot-select[data-activity='Gestão'] {
        background-color: var(--slot-bg-Gestão);
        color: var(--slot-color-Gestão);
        border-color: var(--slot-color-Gestão);
        font-weight: 600;
      }
      .slot-select[data-activity='Comissões'] {
        background-color: var(--slot-bg-Comissões);
        color: var(--slot-color-Comissões);
        border-color: var(--slot-color-Comissões);
        font-weight: 600;
      }

      .total-alert {
        background: rgba(var(--color-primary-rgb), 0.1);
        padding: 1.5rem;
        text-align: center;
        border-radius: 8px;
        font-size: 1.2rem;
        color: var(--color-primary);
        margin-top: 1rem;
        transition: background 0.3s;
      }
      .total-alert.total-excedido {
        background: rgba(211, 47, 47, 0.1);
        color: #c62828;
        border: 1px solid rgba(211, 47, 47, 0.3);
      }
      .total-max {
        font-size: 0.9rem;
        opacity: 0.8;
        margin-left: 4px;
      }
      .total-aviso {
        display: block;
        font-size: 0.85rem;
        margin-top: 4px;
        font-weight: 600;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
        border-top: 1px solid var(--color-border);
        padding-top: 2rem;
      }
      .btn-primary {
        background: var(--color-primary);
        color: white;
        border: none;
        padding: 0.8rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .btn-secondary {
        background: var(--color-background-secondary);
        color: var(--color-text-secondary);
        border: 1px solid var(--color-border);
        padding: 0.8rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        cursor: pointer;
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-primary);
      }
      @media (max-width: 600px) {
        .grid-form {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PitFormComponent {
  private pitRitService = inject(PitRitService);
  private pdfService = inject(PdfGeneratorService);
  private notificationService = inject(NotificationService);
  private cd = inject(ChangeDetectorRef);

  data: any = {};
  readonly periods = ['Manhã', 'Tarde', 'Noite'];
  readonly slots = ['A', 'B', 'C', 'D'];
  readonly days = [0, 1, 2, 3, 4];
  readonly activityOptions = [
    'Aula',
    'Planejamento',
    'Atendimento',
    'Apoio',
    'Orientação',
    'Extracurricular',
    'Pesquisa',
    'Extensão',
    'Gestão',
    'Comissões',
  ];

  readonly sheetData: { title: string; rows: PitTableRow[] }[] = PIT_SHEET_DATA;

  constructor() {
    this.pitRitService.currentPitData$.subscribe((d) => {
      this.data = JSON.parse(JSON.stringify(d));
      this.cd.markForCheck();
    });
  }

  getQValue(qKey: string | undefined): number {
    if (!qKey || qKey === '-') return 0;
    const qNum = parseInt(qKey.substring(1));
    const d = this.data.atividades;
    if (qNum <= 3) return d.ensino.aulas[qKey] || 0;
    if (qNum <= 5) return d.ensino.manutencao[qKey] || 0;
    if (qNum === 6) return d.ensino.apoio[qKey] || 0;
    if (qNum <= 11) return d.ensino.orientacao[qKey] || 0;
    if (qNum <= 13) return d.ensino.extracurricular[qKey] || 0;
    if (qNum <= 20) return d.pesquisa[qKey] || 0;
    if (qNum <= 29) return d.extensao[qKey] || 0;
    if (qNum <= 37) return d.gestao[qKey] || 0;
    if (qNum <= 46) return d.comissoes[qKey] || 0;
    return 0;
  }

  setQValue(qKey: string | undefined, val: number): void {
    if (!qKey || qKey === '-') return;
    if (val < 0) val = 0;
    const qNum = parseInt(qKey.substring(1));
    const d = this.data.atividades;
    if (qNum <= 3) d.ensino.aulas[qKey] = val;
    else if (qNum <= 5) d.ensino.manutencao[qKey] = val;
    else if (qNum === 6) d.ensino.apoio[qKey] = val;
    else if (qNum <= 11) d.ensino.orientacao[qKey] = val;
    else if (qNum <= 13) d.ensino.extracurricular[qKey] = val;
    else if (qNum <= 20) d.pesquisa[qKey] = val;
    else if (qNum <= 29) d.extensao[qKey] = val;
    else if (qNum <= 37) d.gestao[qKey] = val;
    else if (qNum <= 46) d.comissoes[qKey] = val;
    this.update();
  }

  getTValue(tKey: string | undefined): number {
    if (!tKey) return 0;
    const qNum = parseInt(tKey.substring(1));
    const d = this.data.atividades;
    let val = 0;
    if (qNum <= 3) val = d.ensino.aulas[tKey] || 0;
    else if (qNum === 4 || qNum === 5) val = d.ensino.manutencao[tKey] || 0;
    else if (qNum === 6) val = d.ensino.apoio[tKey] || 0;
    else if (qNum <= 11) val = d.ensino.orientacao[tKey] || 0;
    else if (qNum <= 13) val = d.ensino.extracurricular[tKey] || 0;
    else if (qNum <= 20) val = d.pesquisa[tKey] || 0;
    else if (qNum <= 29) val = d.extensao[tKey] || 0;
    else if (qNum <= 37) val = d.gestao[tKey] || 0;
    else if (qNum <= 46) val = d.comissoes[tKey] || 0;
    return Math.round(val * 10) / 10;
  }

  getSubtotal(section: any): number {
    let total = 0;
    section.rows.forEach((row: any) => {
      if (!row.isSubtotal) total += this.getTValue(row.t);
    });
    return Math.round(total * 10) / 10;
  }

  getGrandTotal(): number {
    let total = 0;
    this.sheetData.forEach(sec => {
      sec.rows.forEach((row: any) => {
        if (!row.isSubtotal) total += this.getTValue(row.t);
      });
    });
    return Math.round(total * 10) / 10;
  }

  getMaxCH(): number {
    const regime = this.data?.identificacao?.regime || '40h D.E.';
    if (regime === '20h') return 20;
    if (regime === '30h') return 30;
    return 40;
  }

  update() {
    this.pitRitService.updatePitData(this.data);
  }

  reset() {
    this.pitRitService.resetPit();
    this.notificationService.showInfo('Formulário limpo.');
  }

  generate() {
    if (!this.data.identificacao.nome) {
      this.notificationService.showError(
        'Preencha o seu nome para gerar o PDF.'
      );
      return;
    }

    // Validação estrita: CH total deve ser exatamente igual ao limite do regime
    const totalAtual = this.getGrandTotal();
    const maxPermitido = this.getMaxCH();
    const regime = this.data?.identificacao?.regime || '40h D.E.';

    if (totalAtual > maxPermitido) {
      this.notificationService.showError(
        `A carga horária total (${totalAtual.toFixed(1)}h) excede o limite do regime ${regime} (${maxPermitido}h). Reduza as atividades antes de gerar o PDF.`
      );
      return;
    }

    if (regime === '20h' && totalAtual < maxPermitido) {
      this.notificationService.showError(
        `Regime 20h: a carga horária deve ser exatamente ${maxPermitido}h. Atual: ${totalAtual.toFixed(1)}h. Ajuste as atividades.`
      );
      return;
    }

    if (regime === '30h' && totalAtual < maxPermitido) {
      this.notificationService.showError(
        `Regime 30h: a carga horária deve ser exatamente ${maxPermitido}h. Atual: ${totalAtual.toFixed(1)}h. Ajuste as atividades.`
      );
      return;
    }

    if ((regime === '40h' || regime === '40h D.E.') && totalAtual < maxPermitido) {
      this.notificationService.showError(
        `Regime ${regime}: a carga horária deve ser exatamente ${maxPermitido}h. Atual: ${totalAtual.toFixed(1)}h. Ajuste as atividades.`
      );
      return;
    }

    this.pdfService.generatePitPdf(this.data);
    this.notificationService.showSuccess('PDF do PIT gerado com sucesso!');
  }
}
