import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, RevistaEdicao, RevistaArtigo } from '../../../shared/models';

@Injectable()
export class RevistaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/revista`;

  getEdicoes(): Observable<ApiResponse<RevistaEdicao[]>> {
    return this.http.get<ApiResponse<RevistaEdicao[]>>(`${this.apiUrl}/edicoes`);
  }

  getAdminEdicoes(): Observable<ApiResponse<RevistaEdicao[]>> {
    return this.http.get<ApiResponse<RevistaEdicao[]>>(
      `${this.apiUrl}/edicoes/admin/all`
    );
  }

  getEdicaoById(id: number): Observable<RevistaEdicao> {
    return this.http.get<RevistaEdicao>(`${this.apiUrl}/edicoes/${id}`);
  }

  createEdicao(data: Partial<RevistaEdicao>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.apiUrl}/edicoes`, data);
  }

  updateEdicao(id: number, data: Partial<RevistaEdicao>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/edicoes/${id}`, data);
  }

  deleteEdicao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/edicoes/${id}`);
  }

  getArtigoById(id: number): Observable<RevistaArtigo> {
    return this.http.get<RevistaArtigo>(`${this.apiUrl}/artigos/${id}`);
  }

  createArtigo(
    edicaoId: number,
    data: Partial<RevistaArtigo>
  ): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(
      `${this.apiUrl}/edicoes/${edicaoId}/artigos`,
      data
    );
  }

  updateArtigo(id: number, data: Partial<RevistaArtigo>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/artigos/${id}`, data);
  }

  deleteArtigo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/artigos/${id}`);
  }
}
