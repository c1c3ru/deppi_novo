import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Laboratorio } from '../models/laboratorio.model';

@Injectable({
  providedIn: 'root'
})
export class LaboratoriosService {
  private apiUrl = `${environment.apiUrl}/api/laboratorios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Laboratorio[]> {
    return this.http.get<Laboratorio[]>(this.apiUrl);
  }

  getById(id: string): Observable<Laboratorio> {
    return this.http.get<Laboratorio>(`${this.apiUrl}/${id}`);
  }

  create(lab: Laboratorio): Observable<Laboratorio> {
    return this.http.post<Laboratorio>(this.apiUrl, lab);
  }

  update(id: string, lab: Partial<Laboratorio>): Observable<Laboratorio> {
    return this.http.put<Laboratorio>(`${this.apiUrl}/${id}`, lab);
  }
}
