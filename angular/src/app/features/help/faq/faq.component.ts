import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule, MatAccordion } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class FaqComponent {
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  searchQuery = '';

  faqs = [
    // 🔹 Inicio de sesión
    { question: '¿Cómo puedo recuperar mi contraseña?', answer: 'Ve a la sección de configuración y selecciona "Recuperar contraseña".', icon: 'lock_open', expanded: false },
    { question: '¿Por qué no puedo iniciar sesión?', answer: 'Revisa que tus credenciales sean correctas y que tu cuenta esté activa.', icon: 'login', expanded: false },
    { question: '¿Puedo cambiar mi correo asociado?', answer: 'Sí, en la sección de "Perfil" puedes actualizarlo fácilmente.', icon: 'alternate_email', expanded: false },

    // 🔹 Reportes



    // 🔹 Soporte y configuración
    { question: '¿Cómo contacto con soporte?', answer: 'Puedes ir a la sección de "Contactar Soporte" dentro de este módulo.', icon: 'support_agent', expanded: false },
    { question: '¿Dónde puedo ver la documentación?', answer: 'Ve a la sección "Documentación" en el menú principal.', icon: 'library_books', expanded: false },


    // 🔹 Instalación y actualizaciones



    // 🔹 Seguridad
    { question: '¿Mi información está segura?', answer: 'Sí, utilizamos cifrado AES de 256 bits para proteger tus datos.', icon: 'security', expanded: false },
    { question: '¿Puedo restringir el acceso a ciertos usuarios?', answer: 'Sí, en la sección de Roles y Permisos puedes configurar esto.', icon: 'admin_panel_settings', expanded: false }
  ];

  /** Filtra FAQs según la búsqueda */
  get filteredFaqs() {
    return this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  /** Resalta texto buscado */
  highlightSearch(text: string): string {
    if (!this.searchQuery) return text;
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, `<mark>$1</mark>`);
  }

  /** Limpiar búsqueda */
  clearSearch() {
    this.searchQuery = '';
  }

  /** Expandir todo */
  expandAll() {
    this.faqs.forEach(faq => faq.expanded = true);
  }

  /** Colapsar todo */
  collapseAll() {
    this.faqs.forEach(faq => faq.expanded = false);
  }
}
