import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Attachment {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: string;
  relatedBoletimId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/upload`;

  /**
   * Faz upload de um único arquivo
   */
  uploadFile(file: File, relatedId?: number): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (relatedId) {
      formData.append('relatedId', relatedId.toString());
    }
    return this.http.post<Attachment>(`${this.apiUrl}/file`, formData);
  }

  /**
   * Faz upload de múltiplos arquivos
   */
  uploadMultiple(
    files: File[],
    relatedId?: number
  ): Observable<{ files: Attachment[]; count: number }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (relatedId) {
      formData.append('relatedId', relatedId.toString());
    }
    return this.http.post<{ files: Attachment[]; count: number }>(
      `${this.apiUrl}/multiple`,
      formData
    );
  }

  /**
   * Busca anexos de um boletim
   */
  getAttachments(boletimId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/boletim/${boletimId}`);
  }

  /**
   * Remove um anexo
   */
  deleteAttachment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
