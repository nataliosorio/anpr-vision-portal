/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { General } from '../../../core/services/general.service';
import { ApiResponse } from 'src/app/shared/Models/ApiResponse';

@Injectable({ providedIn: 'root' })
export class PasswordService extends General {
  private readonly endpoint = 'PasswordRecovery';

  /**
   * Paso 1: solicitar recuperación de contraseña
   * POST /User/request-password-reset
   */
  requestPasswordReset(email: string): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`${this.endpoint}/request`, { email });
  }

  /**
   * Paso 2: verificar código de validación
   * POST /User/verify-code
   */
  verifyCode(email: string, code: string): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`${this.endpoint}/verify`, { email, code });
  }

  /**
   * Paso 3: restablecer contraseña
   * POST /User/reset-password
   */
  resetPassword(email: string, code: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`${this.endpoint}/reset`, {
      email,
      code,
      newPassword,
    });
  }
}
