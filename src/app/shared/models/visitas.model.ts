export interface VisitLabAvailability {
  visit_id: string;
  lab_id: string;
  name?: string; // populated from join
  status: 'pending' | 'available' | 'unavailable';
  updated_by_user_id?: string;
}

export interface SchoolVisit {
  id: string;
  school_name: string;
  responsible_name: string;
  contact_email: string;
  contact_phone: string;
  students_count: number;
  target_date: string;
  shift: 'M' | 'T' | 'N';
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  created_at?: string;
  updated_at?: string;
  labs?: VisitLabAvailability[]; // populated when fetched by ID
}
