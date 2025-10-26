/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { General } from 'src/app/core/services/general.service';
import { LoginDto } from '../models/loginDto';
import { AuthData } from '../models/AuthData';
import { ApiResponse } from 'src/app/shared/Models/ApiResponse';


@Injectable({ providedIn: 'root' })
export class AuthService extends General {
  private readonly baseEndpoint = 'Auth';

  /**
   * Inicia sesión de usuario
   * POST /User/login
   */
  login(dto: LoginDto): Observable<AuthData | ApiResponse<AuthData>> {
    return this.post<AuthData | ApiResponse<AuthData>>(`${this.baseEndpoint}/login`, dto);
  }

  /**
   * Registra un nuevo usuario
   * POST /User/register
   */
  register(dto: any): Observable<AuthData | ApiResponse<AuthData>> {
    return this.post<AuthData | ApiResponse<AuthData>>(`${this.baseEndpoint}/register`, dto);
  }
}
