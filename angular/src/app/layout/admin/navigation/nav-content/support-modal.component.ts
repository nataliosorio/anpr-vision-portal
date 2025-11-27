import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-support-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Soporte ANPR VISION</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()" aria-label="Close"></button>
    </div>
    <div class="modal-body text-center">
      <div class="mb-3">
        <img src="assets/images/logoANPR.png" alt="ANPR VISION" style="max-width: 150px;">
      </div>
      <p class="text-muted mb-3">
        ANPR VISION es un sistema avanzado de reconocimiento automático de placas vehiculares
        que facilita la gestión y control de parqueaderos.
      </p>
      <h6>Información de Contacto:</h6>
      <div class="contact-info text-start">
        <p><strong>Correo Corporativo:</strong><br>
        <a href="mailto:info&#64;anpr-vision.com">info&#64;anpr-vision.com</a></p>

        <p><strong>Aníbal (Desarrollador):</strong><br>
        <a href="mailto:anibalalvaradoandrade&#64;gmail.com">anibalalvaradoandrade&#64;gmail.com</a></p>

        <p><strong>Natalia (Desarrolladora):</strong><br>
        <a href="mailto:nataliaosorio973&#64;gmail.com">nataliaosorio973&#64;gmail.com</a></p>
      </div>
      <div class="mt-3">
        <small class="text-muted">
          Para soporte técnico o consultas, por favor contacta a cualquiera de nuestros correos.
          Estamos aquí para ayudarte.
        </small>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Cerrar</button>
    </div>
  `,
  styles: [`
    .contact-info p {
      margin-bottom: 0.5rem;
    }
    .contact-info a {
      color: #007bff;
      text-decoration: none;
    }
    .contact-info a:hover {
      text-decoration: underline;
    }
  `]
})
export class SupportModalComponent {
  activeModal = inject(NgbActiveModal);
}
