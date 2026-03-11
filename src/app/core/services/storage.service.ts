import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Obtém um item do localStorage
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Define um item no localStorage
   */
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('StorageService: falha ao salvar no localStorage', e);
    }
  }

  /**
   * Remove um item do localStorage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('StorageService: falha ao remover do localStorage', e);
    }
  }

  /**
   * Limpa todo o localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('StorageService: falha ao limpar localStorage', e);
    }
  }

  /**
   * Obtém um item e faz parse de JSON
   */
  getObject<T>(key: string): T | null {
    const value = this.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Salva um objeto como JSON
   */
  setObject<T>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('StorageService: falha ao serializar objeto', e);
    }
  }
}
