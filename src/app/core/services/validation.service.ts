import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  /**
   * Verifica se uma matrícula é válida (ao menos 3 caracteres)
   */
  static registration(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.toString().trim();
    if (!value || value.length < 3) {
      return { registration: 'Matrícula inválida (mínimo 3 caracteres)' };
    }
    return null;
  }

  /**
   * Verifica força mínima da senha
   */
  static password(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || value.length < 6) {
      return { password: 'Senha deve ter ao menos 6 caracteres' };
    }
    return null;
  }

  /**
   * Valida formato de e-mail
   */
  static email(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return { email: 'E-mail inválido' };
    }
    return null;
  }

  /**
   * Valida que dois campos de senha conferem
   */
  static passwordMatch(passwordKey: string, confirmKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordKey)?.value;
      const confirm = group.get(confirmKey)?.value;
      if (password && confirm && password !== confirm) {
        return { passwordMatch: 'As senhas não conferem' };
      }
      return null;
    };
  }

  /**
   * Retorna a primeira mensagem de erro de um control
   */
  getErrorMessage(control: AbstractControl | null): string {
    if (!control || !control.errors) return '';
    const [firstKey, firstVal] = Object.entries(control.errors)[0];
    if (typeof firstVal === 'string') return firstVal;
    if (firstKey === 'required') return 'Campo obrigatório';
    if (firstKey === 'minlength')
      return `Mínimo ${firstVal.requiredLength} caracteres`;
    if (firstKey === 'maxlength')
      return `Máximo ${firstVal.requiredLength} caracteres`;
    if (firstKey === 'email') return 'E-mail inválido';
    return 'Campo inválido';
  }
}
