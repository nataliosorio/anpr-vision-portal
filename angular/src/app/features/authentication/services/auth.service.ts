/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

import { LoginDto } from '../models/loginDto';
import { AuthData } from '../models/AuthData';
import { VerificationRequestDto } from '../models/verificationRequestDto';
import { ApiResponse } from 'src/app/shared/Models/ApiResponse';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiURL;
  private readonly baseEndpoint = 'Auth';

  constructor() {}

  // =============================
  // 🔹 Paso 1: Login con envío de código OTP
  // =============================
  login(dto: LoginDto): Observable<ApiResponse<{ userId: number }>> {
    const url = `${this.baseUrl}/${this.baseEndpoint}/login`;
    return this.http.post<ApiResponse<{ userId: number }>>(url, dto).pipe(
      map((res): ApiResponse<{ userId: number }> =>
        this.validateApiResponse<{ userId: number }>(res)
      ),
      catchError((err) => throwError(() => new Error(this.pickErrorMessage(err))))
    );
  }

  // =============================
  // 🔹 Paso 2: Verificación OTP y generación de token JWT
  // =============================
  verifyOtp(dto: VerificationRequestDto): Observable<ApiResponse<AuthData>> {
    const url = `${this.baseUrl}/${this.baseEndpoint}/verify-otp`;
    return this.http.post<ApiResponse<AuthData>>(url, dto).pipe(
      map((res): ApiResponse<AuthData> => this.validateApiResponse<AuthData>(res)),
      catchError((err) => throwError(() => new Error(this.pickErrorMessage(err))))
    );
  }

  // =============================
  // 🔹 Registro de nuevo usuario
  // =============================
  register(dto: any): Observable<ApiResponse<AuthData>> {
    const url = `${this.baseUrl}/${this.baseEndpoint}/register`;
    return this.http.post<ApiResponse<AuthData>>(url, dto).pipe(
      map((res): ApiResponse<AuthData> => this.validateApiResponse<AuthData>(res)),
      catchError((err) => throwError(() => new Error(this.pickErrorMessage(err))))
    );
  }

  // =============================
  // ⚙️ Helpers internos
  // =============================
  private validateApiResponse<T>(res: any): ApiResponse<T> {
    if (!res || typeof res !== 'object' || !('success' in res)) {
      throw new Error('Respuesta del servidor inválida.');
    }
    return res as ApiResponse<T>;
  }

  private pickErrorMessage(err: any): string {
    const httpErr = err as HttpErrorResponse;
    const payload = httpErr?.error;

    if (typeof payload === 'string' && payload.trim().length) return payload;

    if (payload && typeof payload === 'object') {
      if ('message' in payload && payload.message) return payload.message;
      if ('title' in payload && payload.title) return payload.title as string;
      if ('errors' in payload && payload.errors) {
        const firstKey = Object.keys(payload.errors)[0];
        const firstMsg = payload.errors[firstKey]?.[0];
        if (firstMsg) return firstMsg;
      }
    }

    if (httpErr?.message) return httpErr.message;
    if (err?.message) return err.message;

    return 'Ocurrió un error inesperado en la comunicación con el servidor.';
  }
}
