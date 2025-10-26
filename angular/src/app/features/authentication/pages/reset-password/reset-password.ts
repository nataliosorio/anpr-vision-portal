/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordService } from 'src/app/features/authentication/services/password.service'; // ✅ corregido
import { ApiResponse } from 'src/app/shared/Models/ApiResponse';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent {
  step = 1; // 1=solicitar, 2=verificar, 3=resetear, 4=completado
  emailForm!: FormGroup;
  codeForm!: FormGroup;
  resetForm!: FormGroup;
  loading = false;
  message = '';
  email = '';

  otpIdx: number[] = [0, 1, 2, 3, 4, 5];

  // 👁️ toggles para ver/ocultar contraseña
  showNew = false;
  showConfirm = false;

  // DI
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private passwordService = inject(PasswordService);

  constructor() {
    this.initForms();
  }

  initForms(): void {
    this.emailForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]
      ]
    });

    const otpControls: Record<string, any> = {};
    for (let i = 0; i < 6; i++) {
      otpControls[String(i)] = ['', [Validators.required, Validators.pattern(/^\d$/)]];
    }
    this.codeForm = this.fb.group(otpControls);

    this.resetForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(15),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
          ]
        ],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(form: FormGroup) {
    const a = form.get('newPassword')?.value;
    const b = form.get('confirmPassword')?.value;
    return a === b ? null : { mismatch: true };
  }

  // Paso 1
  requestReset(): void {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched(this.emailForm);
      return;
    }
    this.loading = true;
    this.message = '';
    this.email = this.emailForm.value.email;

    this.passwordService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.step = 2;
        this.message = '📧 Código enviado a tu correo electrónico';
      },
      error: (err) => {
        this.loading = false;
        this.message = this.getErrorMessage(err, 'Error al solicitar el restablecimiento');
      }
    });
  }

  // Paso 2
  verifyCode(): void {
    if (this.codeForm.invalid || this.code.length !== 6) {
      this.markFormGroupTouched(this.codeForm);
      return;
    }
    this.loading = true;
    this.message = '';

    this.passwordService.verifyCode(this.email, this.code).subscribe({
      next: (res: ApiResponse<any> | any) => {
        this.loading = false;
        if (res?.success === true || res?.valid === true) {
          this.step = 3;
          this.message = '✅ Código verificado correctamente';
        } else {
          this.message = '❌ Código inválido. Verifica e intenta nuevamente';
          this.clearOtp();
        }
      },
      error: (err) => {
        this.loading = false;
        this.message = this.getErrorMessage(err, 'Error al verificar el código');
        this.clearOtp();
      }
    });
  }

  // Paso 3
  resetPassword(): void {
    if (this.resetForm.invalid) {
      this.markFormGroupTouched(this.resetForm);
      return;
    }
    this.loading = true;
    this.message = '';
    const { newPassword } = this.resetForm.value;

    this.passwordService.resetPassword(this.email, this.code, newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.step = 4;
        this.message = '🎉 Contraseña restablecida con éxito';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.message = this.getErrorMessage(err, 'Error al restablecer la contraseña');
      }
    });
  }

  // Auxiliares
  private markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(k => form.get(k)?.markAsTouched());
  }

  private getErrorMessage(error: any, fallback: string): string {
    return `❌ ${error?.message || fallback}`;
  }

  resendCode(): void {
    if (this.step !== 2) return;
    this.loading = true;
    this.passwordService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.message = '📧 Nuevo código enviado';
      },
      error: (err) => {
        this.loading = false;
        this.message = this.getErrorMessage(err, 'Error al reenviar código');
      }
    });
  }

  resetFlow(): void {
    this.step = 1;
    this.message = '';
    this.email = '';
    this.loading = false;
    this.initForms();
  }

  onEmailInput(): void {}

  onPasswordInput(): void {
    const c = this.resetForm.get('confirmPassword');
    if (c?.value) c.updateValueAndValidity();
  }

  // Getters de errores
  get emailErrors(): string | null {
    const c = this.emailForm.get('email');
    if (c?.errors && c?.touched) {
      if (c.errors['required']) return 'El correo es requerido';
      if (c.errors['email']) return 'Ingresa un correo válido';
      if (c.errors['pattern']) return 'Formato de correo inválido';
    }
    return null;
  }

  get codeErrors(): string | null {
    const filled = this.code.replace(/\D/g, '');
    if (filled.length === 0 && !this.anyOtpTouched) return null;
    if (filled.length < 6) return 'El código debe tener 6 dígitos';
    if (!/^\d{6}$/.test(filled)) return 'Solo se permiten números';
    return null;
  }

  get passwordErrors(): string | null {
    const c = this.resetForm.get('newPassword');
    if (c?.errors && c?.touched) {
      if (c.errors['required']) return 'La contraseña es requerida';
      if (c.errors['minlength']) return 'Mínimo 15 caracteres';
      if (c.errors['pattern'])
        return 'Debe contener al menos: 1 mayúscula, 1 minúscula y 1 número';
    }
    return null;
  }

  get confirmPasswordErrors(): string | null {
    const c = this.resetForm.get('confirmPassword');
    if (c?.errors && c?.touched) {
      if (c.errors['required']) return 'Confirma tu contraseña';
    }
    if (this.resetForm.hasError('mismatch') && c?.touched)
      return 'Las contraseñas no coinciden';
    return null;
  }

  private get anyOtpTouched(): boolean {
    return this.otpIdx.some(i => this.codeForm.get(String(i))?.touched);
  }

  get code(): string {
    return this.otpIdx.map(i => this.codeForm.get(String(i))?.value || '').join('');
  }

  private clearOtp(): void {
    this.otpIdx.forEach(i => {
      this.codeForm.get(String(i))?.setValue('');
      this.codeForm.get(String(i))?.markAsUntouched();
    });
    (document.getElementById('otp-0') as HTMLInputElement | null)?.focus();
  }

  onOtpInput(i: number, e: Event) {
    const input = e.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '');
    if (v.length > 1) v = v.slice(-1);
    input.value = v;
    this.codeForm.get(String(i))?.setValue(v);
    this.codeForm.get(String(i))?.markAsTouched();

    if (v && i < 5) {
      const next = (input.parentElement as HTMLElement)
        .querySelectorAll<HTMLInputElement>('.otp-box')[i + 1];
      next?.focus();
      next?.select();
    }
  }

  onOtpKeydown(i: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];

    if (allowed.includes(event.key)) {
      if (event.key === 'Backspace' && !input.value && i > 0) {
        const prev = (input.parentElement as HTMLElement)
          .querySelectorAll<HTMLInputElement>('.otp-box')[i - 1];
        prev?.focus();
        prev?.select();
        this.codeForm.get(String(i - 1))?.setValue('');
        this.codeForm.get(String(i - 1))?.markAsTouched();
      }
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    input.value = event.key;
    this.codeForm.get(String(i))?.setValue(event.key);
    this.codeForm.get(String(i))?.markAsTouched();

    const next = (input.parentElement as HTMLElement)
      .querySelectorAll<HTMLInputElement>('.otp-box')[i + 1];
    if (next) {
      next.focus();
      next.select();
    }
  }

  onOtpPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!text) return;

    const cells = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLInputElement>('.otp-box')
    );
    cells.forEach((cell, idx) => {
      const d = text[idx] ?? '';
      cell.value = d;
      this.codeForm.get(String(idx))?.setValue(d);
      this.codeForm.get(String(idx))?.markAsTouched();
    });

    const focusIndex = Math.min(text.length, 5);
    cells[focusIndex]?.focus();
  }
}
