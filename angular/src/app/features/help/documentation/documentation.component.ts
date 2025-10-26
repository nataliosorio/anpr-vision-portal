import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class DocumentationComponent {
  searchQuery = '';
  selectedCategory = 'all';

  documents = [
    // Manuales
    { title: 'Guía de usuario', description: 'Aprende a usar todas las funcionalidades del sistema.', link: '/assets/docs/user-guide.pdf', category: 'manual', icon: 'menu_book' },
    { title: 'Manual de instalación', description: 'Instala y configura ANPR Vision paso a paso.', link: '/assets/docs/install-guide.pdf', category: 'install', icon: 'build' },
    { title: 'Manual de configuración', description: 'Configura parámetros y ajusta tu sistema.', link: '/assets/docs/config-guide.pdf', category: 'manual', icon: 'tune' },
    { title: 'Manual avanzado', description: 'Guía para administradores y usuarios expertos.', link: '/assets/docs/advanced-guide.pdf', category: 'manual', icon: 'school' },

    // Seguridad
    { title: 'Políticas de seguridad', description: 'Todo lo que necesitas saber sobre la seguridad de datos.', link: '/assets/docs/security.pdf', category: 'security', icon: 'security' },
    { title: 'Cifrado de datos', description: 'Detalles sobre el cifrado y manejo seguro de información.', link: '/assets/docs/encryption.pdf', category: 'security', icon: 'lock' },

    // Técnico
    { title: 'Manual técnico', description: 'Información detallada para desarrolladores.', link: '/assets/docs/tech-guide.pdf', category: 'technical', icon: 'engineering' },
    { title: 'Integración con API', description: 'Cómo conectar ANPR Vision con APIs externas.', link: '/assets/docs/api-integration.pdf', category: 'technical', icon: 'api' }

    // Mantenimiento



    // Otros
  ];

  get filteredDocuments() {
    return this.documents.filter(doc =>
      (this.selectedCategory === 'all' || doc.category === this.selectedCategory) &&
      doc.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  filterCategory(category: string) {
    this.selectedCategory = category;
  }

  openDoc(link: string) {
    window.open(link, '_blank');
  }

  previewDoc(link: string) {
    window.open(link, '_blank');
  }
}
