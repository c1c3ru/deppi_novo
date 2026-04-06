export interface Production {
  title: string;
  type: string;
  year?: string;
  link?: string;
}

export interface Service {
  name: string;
  description: string;
  type: string;
}

export interface Laboratorio {
  id?: string;
  name: string;
  description: string;
  cover_image?: string;
  productions: Production[];
  services: Service[];
  created_at?: string;
  updated_at?: string;
}
