import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Boletim, ApiResponse } from '../../../shared/models';

@Injectable()
export class BoletinsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/boletins`;

  /**
   * Busca todos os boletins publicados
   */
  getAll(page = 1, limit = 10): Observable<ApiResponse<Boletim[]>> {
    return this.http.get<ApiResponse<Boletim[]>>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }
  /**
   * Busca todos os boletins do admin
   */
  getAdminAll(page = 1, limit = 10): Observable<ApiResponse<Boletim[]>> {
    return this.http.get<ApiResponse<Boletim[]>>(
      `${this.apiUrl}/admin/all?page=${page}&limit=${limit}`
    );
  }

  /**
   * Busca um boletim pelo ID
   */
  getById(id: number): Observable<Boletim> {
    return this.http.get<Boletim>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo boletim (admin)
   */
  create(data: Partial<Boletim>): Observable<Boletim> {
    return this.http.post<Boletim>(this.apiUrl, data);
  }

  /**
   * Atualiza um boletim (admin)
   */
  update(id: number, data: Partial<Boletim>): Observable<Boletim> {
    return this.http.put<Boletim>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Remove um boletim (admin)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
