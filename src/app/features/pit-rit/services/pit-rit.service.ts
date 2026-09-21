import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PitData {
  semestre: string;
  identificacao: {
    nome: string;
    siape: string;
    curso: string;
    campus: string;
    telefone: string;
    email: string;
    vinculo: string;
    regime: string;
  };
  atividades: {
    ensino: {
      aulas: {
        q1: number;
        q2: number;
        q3: number;
        t1: number;
        t2: number;
        t3: number;
      };
      manutencao: { q4: number; q5: number; t4: number; t5: number };
      apoio: { q6: number; t6: number };
      orientacao: {
        q7: number;
        q8: number;
        q9: number;
        q10: number;
        q11: number;
        t7: number;
        t8: number;
        t9: number;
        t10: number;
        t11: number;
      };
      extracurricular: { q12: number; q13: number; t12: number; t13: number };
    };
    pesquisa: {
      q14: number;
      q15: number;
      q16: number;
      q17: number;
      q18: number;
      q19: number;
      q20: number;
      t14: number;
      t15: number;
      t16: number;
      t17: number;
      t18: number;
      t19: number;
      t20: number;
    };
    extensao: {
      q21: number;
      q22: number;
      q23: number;
      q24: number;
      q25: number;
      q26: number;
      q27: number;
      q28: number;
      q29: number;
      t21: number;
      t22: number;
      t23: number;
      t24: number;
      t25: number;
      t26: number;
      t27: number;
      t28: number;
      t29: number;
    };
    gestao: {
      q30: number;
      q31: number;
      q32: number;
      q33: number;
      q34: number;
      q35: number;
      q36: number;
      q37: number;
      t30: number;
      t31: number;
      t32: number;
      t33: number;
      t34: number;
      t35: number;
      t36: number;
      t37: number;
    };
    comissoes: {
      q38: number;
      q39: number;
      q40: number;
      q41: number;
      q42: number;
      q43: number;
      q44: number;
      q45: number;
      q46: number;
      t38: number;
      t39: number;
      t40: number;
      t41: number;
      t42: number;
      t43: number;
      t44: number;
      t45: number;
      t46: number;
    };
  };
  total: number;
  horarios: string[][];
}

export interface RitData {
  semestre: string;
  identificacao: {
    nome: string;
    siape: string;
    curso: string;
    campus: string;
    telefone: string;
    email: string;
    vinculo: string;
    regime: string;
  };
  relatorios: {
    ensino: string;
    pesquisa: string;
    extensao: string;
    gestao: string;
    capacitacao: string;
  };
  horarios: string[][]; // 12 rows (Manhã A-D, Tarde A-D, Noite A-D) x 5 columns (Seg-Sex)
}

@Injectable({
  providedIn: 'root',
})
export class PitRitService {
  private pitData$ = new BehaviorSubject<PitData>(this.getInitialPitData());
  private ritData$ = new BehaviorSubject<RitData>(this.getInitialRitData());

  currentPitData$ = this.pitData$.asObservable();
  currentRitData$ = this.ritData$.asObservable();

  constructor() {}

  private getInitialPitData(): PitData {
    return {
      semestre: '',
      identificacao: {
        nome: '',
        siape: '',
        curso: '',
        campus: 'Maracanaú',
        telefone: '',
        email: '',
        vinculo: '',
        regime: '40h D.E.',
      },
      atividades: {
        ensino: {
          aulas: { q1: 0, q2: 0, q3: 0, t1: 0, t2: 0, t3: 0 },
          manutencao: { q4: 0, q5: 0, t4: 0, t5: 0 },
          apoio: { q6: 0, t6: 0 },
          orientacao: {
            q7: 0,
            q8: 0,
            q9: 0,
            q10: 0,
            q11: 0,
            t7: 0,
            t8: 0,
            t9: 0,
            t10: 0,
            t11: 0,
          },
          extracurricular: { q12: 0, q13: 0, t12: 0, t13: 0 },
        },
        pesquisa: {
          q14: 0,
          q15: 0,
          q16: 0,
          q17: 0,
          q18: 0,
          q19: 0,
          q20: 0,
          t14: 0,
          t15: 0,
          t16: 0,
          t17: 0,
          t18: 0,
          t19: 0,
          t20: 0,
        },
        extensao: {
          q21: 0,
          q22: 0,
          q23: 0,
          q24: 0,
          q25: 0,
          q26: 0,
          q27: 0,
          q28: 0,
          q29: 0,
          t21: 0,
          t22: 0,
          t23: 0,
          t24: 0,
          t25: 0,
          t26: 0,
          t27: 0,
          t28: 0,
          t29: 0,
        },
        gestao: {
          q30: 0,
          q31: 0,
          q32: 0,
          q33: 0,
          q34: 0,
          q35: 0,
          q36: 0,
          q37: 0,
          t30: 0,
          t31: 0,
          t32: 0,
          t33: 0,
          t34: 0,
          t35: 0,
          t36: 0,
          t37: 0,
        },
        comissoes: {
          q38: 0,
          q39: 0,
          q40: 0,
          q41: 0,
          q42: 0,
          q43: 0,
          q44: 0,
          q45: 0,
          q46: 0,
          t38: 0,
          t39: 0,
          t40: 0,
          t41: 0,
          t42: 0,
          t43: 0,
          t44: 0,
          t45: 0,
          t46: 0,
        },
      },
      total: 0,
      horarios: Array(12)
        .fill(0)
        .map(() => Array(5).fill('')),
    } as any;
  }

  private getInitialRitData(): RitData {
    return {
      semestre: '',
      identificacao: {
        nome: '',
        siape: '',
        curso: '',
        campus: 'Maracanaú',
        telefone: '',
        email: '',
        vinculo: '',
        regime: '40h D.E.',
      },
      relatorios: {
        ensino: '',
        pesquisa: '',
        extensao: '',
        gestao: '',
        capacitacao: '',
      },
      horarios: Array(12)
        .fill(0)
        .map(() => Array(5).fill('')),
    };
  }

  updatePitData(newData: Partial<PitData>) {
    const current = this.pitData$.value;
    this.pitData$.next({ ...current, ...newData });
    this.calculatePitTotals();
  }

  updateRitData(newData: Partial<RitData>) {
    const current = this.ritData$.value;
    this.ritData$.next({ ...current, ...newData });
  }

  private calculatePitTotals() {
    const data = this.pitData$.value;
    const regime = data.identificacao.regime;

    const multipliers: { [key: string]: number } = {
      q1: 1,
      q2: 1,
      q3: 0.05,
      q4: 0.8,
      q5: 0.2,
      q6: 1,
      q7: 1,
      q8: 1,
      q9: 2,
      q10: 2,
      q11: 10,
      q12: 8,
      q13: 1,
      q14: 4,
      q15: 6,
      q16: 3,
      q17: 2,
      q18: 16,
      q19: 8,
      q20: 16,
      q21: 4,
      q22: 6,
      q23: 3,
      q24: 16,
      q25: 5,
      q26: 3,
      q27: 0.05,
      q28: 0.05,
      q29: 1,
      q30: 18,
      q31: 18,
      q32: 18,
      q33: 18,
      q34: 18,
      q35: 18,
      q36: 18,
      q37: 18,
      q38: 3,
      q39: 8,
      q40: 4,
      q41: 1,
      q42: 1,
      q43: 1,
      q44: 4,
      q45: 4,
      q46: 1,
    };

    // Calculate individual 't' values
    Object.keys(multipliers).forEach((qKey) => {
      const category = this.findCategory(qKey);
      const subCategory = this.findSubCategory(qKey);
      if (category === 'ensino' && subCategory) {
        (data.atividades as any)[category][subCategory][
          qKey.replace('q', 't')
        ] =
          (data.atividades as any)[category][subCategory][qKey] *
          multipliers[qKey];
      } else if (category && category !== 'ensino') {
        (data.atividades as any)[category][qKey.replace('q', 't')] =
          (data.atividades as any)[category][qKey] * multipliers[qKey];
      }
    });

    // Check for manual overrides for t4, t5, t6
    const m = data.atividades.ensino.manutencao;
    const a = data.atividades.ensino.apoio;

    if (m.q4 > 0) m.t4 = m.q4 * 0.8;
    if (m.q5 > 0) m.t5 = m.q5 * 0.2;
    if (a.q6 > 0) a.t6 = a.q6 * 1;

    // Special calculations for Ensino (Maintenance and Support)
    const aulasTotal =
      data.atividades.ensino.aulas.t1 +
      data.atividades.ensino.aulas.t2 +
      data.atividades.ensino.aulas.t3;
    const x = Math.min(aulasTotal, 20);

    if (regime === '20h') {
      if (m.q5 <= 0) m.t5 = Math.min(Math.ceil(x * 0.2), 2);
      const T4_calc = Math.ceil(x - m.t5);
      if (m.q4 <= 0) m.t4 = Math.min(T4_calc, 4);
    } else {
      if (m.q5 <= 0) m.t5 = Math.ceil(x * 0.2);
      const T4_calc = Math.ceil(x - m.t5);
      if (m.q4 <= 0) m.t4 = Math.min(T4_calc, 14);
    }

    if (a.q6 <= 0) a.t6 = aulasTotal > 0 ? 2 : 0;

    // Calculate sum for total field
    let total = 0;
    const sumAllT = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          sumAllT(obj[key]);
        } else if (key.startsWith('t')) {
          total += obj[key];
        }
      }
    };
    sumAllT(data.atividades);
    data.total = Math.min(
      total,
      regime === '20h' ? 20 : regime === '30h' ? 30 : 40
    );

    this.pitData$.next({ ...data });
  }

  resetPit() {
    this.pitData$.next(this.getInitialPitData());
  }

  resetRit() {
    this.ritData$.next(this.getInitialRitData());
  }

  private findCategory(qKey: string): string | null {
    const qNum = parseInt(qKey.substring(1));
    if (qNum <= 13) return 'ensino';
    if (qNum <= 20) return 'pesquisa';
    if (qNum <= 29) return 'extensao';
    if (qNum <= 37) return 'gestao';
    if (qNum <= 46) return 'comissoes';
    return null;
  }

  private findSubCategory(qKey: string): string | null {
    const qNum = parseInt(qKey.substring(1));
    if (qNum <= 3) return 'aulas';
    if (qNum <= 11) return 'orientacao';
    if (qNum <= 13) return 'extracurricular';
    if (qNum >= 14 && qNum <= 20) return 'pesquisa'; // Mapping to match interface
    if (qNum >= 21 && qNum <= 29) return 'extensao';
    if (qNum >= 30 && qNum <= 37) return 'gestao';
    if (qNum >= 38 && qNum <= 46) return 'comissoes';
    return null;
  }
}
