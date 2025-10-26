/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular imports
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Project imports
import Swal from 'sweetalert2';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApiResponse } from 'src/app/shared/Models/ApiResponse';
import { AuthData } from '../../models/AuthData';
import { LoginDto } from '../../models/loginDto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [SharedModule, RouterModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent {
  LoginDto: LoginDto = {
    username: '',
    password: '',
  };

  showPassword = false;
  loading = false;

  private service = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  /**
   * Extrae el objeto AuthData independientemente si viene envuelto en ApiResponse
   */
  private unwrapData(resp: AuthData | ApiResponse<AuthData>): AuthData | null {
    const isWrapped = (resp as ApiResponse<AuthData>)?.data !== undefined;
    if (isWrapped) {
      const w = resp as ApiResponse<AuthData>;
      if (!w.success) throw new Error(w.message || 'Error en autenticación.');
      return w.data ?? null;
    }
    return resp as AuthData;
  }

  /**
   * Inicia sesión de usuario
   */
  login() {
    if (!this.LoginDto.username || !this.LoginDto.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, ingresa tu usuario y contraseña.',
      });
      return;
    }

    this.loading = true;

    this.service.login(this.LoginDto).subscribe({
      next: (resp) => {
        let data: AuthData | null = null;
        try {
          data = this.unwrapData(resp);
        } catch (e: any) {
          throw new Error(e?.message || 'Error de autenticación.');
        }

        if (!data?.token) {
          throw new Error('Respuesta inválida del servidor (sin token).');
        }

        // Guardar sesión en localStorage
        localStorage.setItem('authToken', data.token);
        // localStorage.setItem('userRoles', JSON.stringify(data.roles ?? []));
        localStorage.setItem('username', this.LoginDto.username);
        localStorage.setItem('userId', JSON.stringify(data.userId));
        localStorage.setItem('personId', JSON.stringify(data.personId));
        localStorage.setItem('rolesByParking', JSON.stringify(data.rolesByParking));

        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Has iniciado sesión correctamente',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/select-parking']);
        });
      },
      error: (err: Error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: err?.message ?? 'Credenciales incorrectas.',
        });
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  /**
   * Navega a la pantalla de recuperación de contraseña
   */
  restablecerContrasena() {
    this.router.navigate(['/reset-password']);
  }
}
