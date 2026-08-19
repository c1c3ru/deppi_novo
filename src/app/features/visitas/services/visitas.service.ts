import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SchoolVisit } from '../../../shared/models/visitas.model';

@Injectable({
  providedIn: 'root'
})
export class VisitasService {
  private apiUrl = `${environment.apiUrl}/visitas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SchoolVisit[]> {
    return this.http.get<SchoolVisit[]>(this.apiUrl);
  }

  getById(id: string): Observable<SchoolVisit> {
    return this.http.get<SchoolVisit>(`${this.apiUrl}/${id}`);
  }

  create(visit: Partial<SchoolVisit> & { lab_ids: string[] }): Observable<SchoolVisit> {
    return this.http.post<SchoolVisit>(this.apiUrl, visit);
  }

  updateStatus(id: string, status: string): Observable<SchoolVisit> {
    return this.http.patch<SchoolVisit>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateLabAvailability(visitId: string, labId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${visitId}/labs/${labId}`, { status });
  }
}
