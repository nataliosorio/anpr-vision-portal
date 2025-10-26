/* eslint-disable @angular-eslint/prefer-inject */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-contact-support',
  standalone: true,
  templateUrl: './contact-support.component.html',
  styleUrls: ['./contact-support.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ]
})
export class ContactSupportComponent {
  supportForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.supportForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.supportForm.valid) {
      console.log('Formulario enviado:', this.supportForm.value);
      alert('✅ Mensaje enviado exitosamente. Nuestro equipo se pondrá en contacto contigo.');
      this.supportForm.reset();
    }
  }
}
