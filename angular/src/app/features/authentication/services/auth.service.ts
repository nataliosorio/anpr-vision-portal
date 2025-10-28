/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { General } from 'src/app/core/services/general.service';
import { LoginDto } from '../models/loginDto';
import { AuthData } from '../models/AuthData';
import { VerificationRequestDto } from '../models/verificationRequestDto';
import { ApiResponse } from 'src/app/shared/Models/ApiResponse';

@Injectable({ providedIn: 'root' })
export class AuthService extends General {
  private readonly baseEndpoint = 'Auth';

  /**
   * Paso 1: Valida credenciales y envía código OTP
   */
  login(dto: LoginDto): Observable<ApiResponse<{ userId: number }>> {
    return this.post<ApiResponse<{ userId: number }>>(
      `${this.baseEndpoint}/login`,
      dto
    );
  }

  /**
   * Paso 2: Verifica código OTP y genera token
   */
  verifyOtp(dto: VerificationRequestDto): Observable<ApiResponse<AuthData>> {
    return this.post<ApiResponse<AuthData>>(
      `${this.baseEndpoint}/verify-otp`,
      dto
    );
  }

  /**
   * Registra un nuevo usuario
   */
  register(dto: any): Observable<ApiResponse<AuthData>> {
    return this.post<ApiResponse<AuthData>>(`${this.baseEndpoint}/register`, dto);
  }
}
