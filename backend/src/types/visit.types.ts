export type VisitShift = 'M' | 'T' | 'N';
export type VisitStatus = 'pending' | 'confirmed' | 'canceled' | 'completed';

export interface SchoolVisit {
  id: string;
  school_name: string;
  responsible_name: string;
  contact_email: string;
  contact_phone: string;
  students_count: number;
  target_date: string;
  shift: VisitShift;
  status: VisitStatus;

  // Campos complementares de cadastro escolar (opcionais — colunas
  // nullable, preenchidas a partir do formulário de agendamento).
  school_city?: string;
  school_network?: string;
  director_name?: string;
  institutional_email?: string;
  whatsapp_phone?: string;
  class_supervisors?: string;
  grade_level?: string;
  notes?: string;

  created_at?: string;
  updated_at?: string;
}

// Campos aceitos na criação de uma solicitação de visita (POST /visitas).
export type CreateSchoolVisitInput = Pick<
  SchoolVisit,
  | 'school_name'
  | 'responsible_name'
  | 'contact_email'
  | 'contact_phone'
  | 'students_count'
  | 'target_date'
  | 'shift'
> &
  Partial<
    Pick<
      SchoolVisit,
      | 'school_city'
      | 'school_network'
      | 'director_name'
      | 'institutional_email'
      | 'whatsapp_phone'
      | 'class_supervisors'
      | 'grade_level'
      | 'notes'
    >
  >;

export const MAX_STUDENTS_PER_VISIT = 50;
