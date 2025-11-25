/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { General } from 'src/app/core/services/general.service';
import { MatInputModule } from '@angular/material/input';

import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

interface Role {
  id: number;
  name: string;
}

interface FormOption {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
}

interface RolFormPermissionResponse {
  rolId: number;
  rolName: string;
  forms: Array<{
    formId: number;
    formName: string;
    formUrl?: string | null;
    permissions: string[];
    modules: Array<{ id: number; name: string }>;
  }>;
}

@Component({
  selector: 'app-rol-form-per-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatInputModule          
  ],
  templateUrl: './rol-form-per-form.html',
  styleUrl: './rol-form-per-form.scss'
})
export class RolFormPerForm implements OnInit {

  form: FormGroup;

  // Catálogos
  roles: Role[] = [];
  forms: FormOption[] = [];
  permissions: Permission[] = [];

  // Datos actuales del rol
  permissionsData: RolFormPermissionResponse | null = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  // Estado de flujo
  showPermissionsSection = false;   // tabla de formularios del rol
  isAddingForm = false;             // se está en modo "agregar formulario"
  selectedFormId: number | null = null;
  selectedFormName = '';
  selectedPermissionIds: number[] = [];

  isSaving = false;

  displayedColumns: string[] = ['formName', 'module', 'permissions'];
  // Estado de flujo

// 🔹 NUEVO: permisos que ya existían para ese formulario

existingPermissionIdsForSelectedForm: number[] = [];

  private fb = inject(FormBuilder);
  private service = inject(General);

  constructor() {
    this.form = this.fb.group({
      rolId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();

    // Cada vez que cambie el rol, recargamos la info del rol y reseteamos el flujo
    this.form.get('rolId')?.valueChanges.subscribe(rolId => {
      if (rolId) {
        this.resetAddFormFlow();
        this.loadPermissionsForRole(rolId);
      } else {
        this.clearRoleData();
      }
    });
  }

  // -----------------------
  // Cargas iniciales
  // -----------------------

  private loadRoles(): void {
    this.service.get<Role[]>('Rol/select').subscribe({
      next: roles => {
        this.roles = roles || [];
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los roles.', 'error');
      }
    });
  }

  private loadPermissionsForRole(rolId: number): void {
  this.service
    .get<{ data: RolFormPermissionResponse }>(`RolFormPermission/byRol/${rolId}`)
    .subscribe({
      next: (res) => {
        // Soportar tanto { data: {...} } como {...} plano por si acaso
        const payload = (res as any).data ?? (res as any);

        this.permissionsData = payload || null;
        this.dataSource.data = payload?.forms || [];
        this.showPermissionsSection = !!this.dataSource.data.length;
        this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
  const term = (filter || '').trim().toLowerCase();

  const formName = (data.formName || '').toLowerCase();
  const moduleName = (data.modules?.[0]?.name || '').toLowerCase();
  const permissions = (data.permissions || []).join(', ').toLowerCase();

  return (
    formName.includes(term) ||
    moduleName.includes(term) ||
    permissions.includes(term)
  );
};

        // (Opcional) debug
        console.log('permissionsData', this.permissionsData);
        console.log('dataSource', this.dataSource.data);
      },
      error: (err: Error) => {
        this.permissionsData = null;
        this.dataSource.data = [];
        this.showPermissionsSection = false;
        Swal.fire(
          'Error',
          err.message || 'No se pudieron cargar los permisos del rol.',
          'error'
        );
      }
    });
}
applyFilter(event: Event): void {
  const value = (event.target as HTMLInputElement).value || '';
  this.dataSource.filter = value.trim().toLowerCase();
}


 private loadForms(): void {
  if (this.forms.length > 0) {
    return;
  }
  this.service.get<FormOption[]>('Form/select').subscribe({
    next: forms => {
      this.forms = forms || [];
    },
    error: (err: Error) => {
      Swal.fire('Error', err.message || 'No se pudieron cargar los formularios.', 'error');
    }
  });
}


  private loadPermissionsCatalog(): void {
    if (this.permissions.length > 0) {
      return;
    }
    this.service.get<Permission[]>('Permission/select').subscribe({
      next: permissions => {
        this.permissions = permissions || [];
        this.syncSelectedPermissionsForForm();
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los permisos.', 'error');
      }
    });
  }

  // -----------------------
  // Flujo "Agregar formulario"
  // -----------------------

  onClickAddForm(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      Swal.fire('Atención', 'Debes seleccionar primero un rol.', 'warning');
      return;
    }

    this.isAddingForm = true;
    this.selectedFormId = null;
    this.selectedFormName = '';
    this.selectedPermissionIds = [];

    this.loadForms();
    this.loadPermissionsCatalog();
  }

 onFormSelected(formId: number): void {
  this.selectedFormId = formId;
  const formSelected = this.forms.find(f => f.id === formId);
  this.selectedFormName = formSelected?.name || '';

  this.syncSelectedPermissionsForForm();
}

private syncSelectedPermissionsForForm(): void {
  // Si aún no hay datos o no hay formulario seleccionado, limpiar
  if (!this.permissionsData || !this.selectedFormId || !this.permissions.length) {
    this.existingPermissionIdsForSelectedForm = [];
    this.selectedPermissionIds = [];
    return;
  }

  // Buscar el formulario seleccionado dentro de los datos agrupados del rol
  const formData = this.permissionsData.forms.find(f => f.formId === this.selectedFormId);
  if (!formData) {
    this.existingPermissionIdsForSelectedForm = [];
    this.selectedPermissionIds = [];
    return;
  }

  // Nombres de permisos que ya están asociados (vienen del back)
  const currentPermissionNames = formData.permissions || [];

  // Mapear esos nombres a IDs según el catálogo de permisos
  const existingIds = this.permissions
    .filter(p => currentPermissionNames.includes(p.name))
    .map(p => p.id);

  // 🔹 Guardamos los permisos ya existentes
  this.existingPermissionIdsForSelectedForm = existingIds;

  // 🔹 Los mostramos como ya seleccionados en el checklist
  this.selectedPermissionIds = [...existingIds];
}


  onPermissionChange(permissionId: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedPermissionIds.includes(permissionId)) {
        this.selectedPermissionIds = [...this.selectedPermissionIds, permissionId];
      }
    } else {
      this.selectedPermissionIds = this.selectedPermissionIds.filter(id => id !== permissionId);
    }
  }

  // -----------------------
  // Guardar
  // -----------------------

  get canShowSave(): boolean {
    return this.isAddingForm && !!this.selectedFormId;
  }

 get canSave(): boolean {
  if (!this.form.valid || !this.selectedFormId) {
    return false;
  }

  // Solo contar permisos NUEVOS (no los que ya existían)
  const newPermissionIds = this.selectedPermissionIds
    .filter(id => !this.existingPermissionIdsForSelectedForm.includes(id));

  return newPermissionIds.length > 0;
}


onSave(): void {
  if (!this.canSave) {
    Swal.fire('Error', 'Debes seleccionar al menos un permiso nuevo para guardar.', 'error');
    return;
  }

  const rolId = this.form.get('rolId')?.value as number;
  const formId = this.selectedFormId as number;

  // 🔹 Filtrar solo los permisos NUEVOS
  const newPermissionIds = this.selectedPermissionIds
    .filter(id => !this.existingPermissionIdsForSelectedForm.includes(id));

  const requests = newPermissionIds.map(permissionId => {
    const dto = {
      rolId,
      formId,
      permissionId,
      asset: true
    };

    console.log('DTO enviado a RolFormPermission:', dto);

    return this.service.post('RolFormPermission', dto);
  });

  if (!requests.length) {
    Swal.fire('Información', 'No hay permisos nuevos para registrar.', 'info');
    return;
  }

  this.isSaving = true;
  forkJoin(requests).subscribe({
    next: () => {
      this.isSaving = false;
      Swal.fire({
        icon: 'success',
        title: 'Permisos asignados exitosamente',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      // Recargar la info del rol para reflejar cambios en la tabla
      this.loadPermissionsForRole(rolId);
      this.resetAddFormFlow();
    },
    error: (err: any) => {
      this.isSaving = false;
      console.error('Error al guardar permisos', err);
      Swal.fire(
        'Error',
        err?.error?.message || err.message || 'No se pudieron asignar los permisos.',
        'error'
      );
    }
  });
}



  // -----------------------
  // Utilidades / reset
  // -----------------------

  onCancelAddForm(): void {
    this.resetAddFormFlow();
  }

  private resetAddFormFlow(): void {
    this.isAddingForm = false;
    this.selectedFormId = null;
    this.selectedFormName = '';
    this.selectedPermissionIds = [];
     this.existingPermissionIdsForSelectedForm = [];
  }

  private clearRoleData(): void {
    this.permissionsData = null;
    this.dataSource.data = [];
    this.showPermissionsSection = false;
    this.resetAddFormFlow();
  }
}
