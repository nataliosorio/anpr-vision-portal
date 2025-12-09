/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
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
import { MatStepperModule } from '@angular/material/stepper';

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
    MatInputModule,
    MatStepperModule
  ],
  templateUrl: './rol-form-per-form.html',
  styleUrl: './rol-form-per-form.scss'
})
export class RolFormPerForm implements OnInit {

  @ViewChild('stepper') stepper!: MatStepper;

  form: FormGroup;

  isLinear = true;
  isEditMode = false;

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

  // Para gestión bulk de permisos
  bulkSelections: { [formId: number]: number[] } = {};
  initialSelections: { [formId: number]: number[] } = {};

  isSaving = false;

  displayedColumns: string[] = ['formName', 'module', 'permissions'];
  // Estado de flujo

// 🔹 NUEVO: permisos que ya existían para ese formulario

existingPermissionIdsForSelectedForm: number[] = [];

  private fb = inject(FormBuilder);
  private service = inject(General);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.form = this.fb.group({
      rolId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadRoles(); // Necesario para mostrar el nombre en el select
      this.loadRoleForEdit(+id);
    } else {
      this.loadRoles();
      // Cada vez que cambie el rol, recargamos la info del rol y reseteamos el flujo
      this.form.get('rolId')?.valueChanges.subscribe(rolId => {
        if (rolId) {
          this.resetAddFormFlow();
          this.loadPermissionsForRole(rolId);
        } else {
          this.clearRoleData();
          // Resetear stepper si es necesario
          setTimeout(() => this.stepper.reset(), 100);
        }
      });
    }
  }

  nextStep(): void {
    this.stepper.next();
  }

  prevStep(): void {
    this.stepper.previous();
  }

  // -----------------------
  // Cargas iniciales
  // -----------------------

  private loadRoleForEdit(rolId: number): void {
    this.form.patchValue({ rolId });
    this.loadPermissionsForRole(rolId);
  }

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

        // Inicializar selecciones iniciales para bulk
        this.initialSelections = {};
        this.bulkSelections = {};
        this.permissionsData?.forms.forEach(form => {
          const permissionIds = this.permissions
            .filter(p => form.permissions?.includes(p.name))
            .map(p => p.id);
          this.initialSelections[form.formId] = [...permissionIds];
          this.bulkSelections[form.formId] = [...permissionIds];
        });
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

    // Avanzar al siguiente paso
    this.nextStep();
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

  // Contar permisos NUEVOS y permisos REMOVIDOS respecto a los existentes
  const newPermissionIds = this.selectedPermissionIds.filter(id => !this.existingPermissionIdsForSelectedForm.includes(id));
  const removedPermissionIds = this.existingPermissionIdsForSelectedForm.filter(id => !this.selectedPermissionIds.includes(id));

  return newPermissionIds.length > 0 || removedPermissionIds.length > 0;
}


onSave(): void {
  if (!this.canSave) {
    Swal.fire('Error', 'No hay cambios en los permisos para guardar.', 'error');
    return;
  }

  const rolId = this.form.get('rolId')?.value as number;
  const formId = this.selectedFormId as number;

  // Permisos a agregar
  const newPermissionIds = this.selectedPermissionIds.filter(id => !this.existingPermissionIdsForSelectedForm.includes(id));
  // Permisos a quitar
  const removedPermissionIds = this.existingPermissionIdsForSelectedForm.filter(id => !this.selectedPermissionIds.includes(id));

  const requests: any[] = [];

  newPermissionIds.forEach(permissionId => {
    requests.push({ rolId, formId, permissionId, asset: true });
  });

  removedPermissionIds.forEach(permissionId => {
    requests.push({ rolId, formId, permissionId, asset: false });
  });

  if (!requests.length) {
    Swal.fire('Información', 'No hay cambios en los permisos.', 'info');
    return;
  }

  this.isSaving = true;
  forkJoin(requests.map(req => this.service.post('RolFormPermission', req))).subscribe({
    next: () => {
      this.isSaving = false;
      Swal.fire({
        icon: 'success',
        title: 'Cambios en permisos guardados exitosamente',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      // Volver al listado de permisos del rol o recargar
      this.resetAddFormFlow();
      this.loadPermissionsForRole(rolId);
      this.prevStep();
    },
    error: (err: any) => {
      this.isSaving = false;
      console.error('Error al guardar permisos', err);
      Swal.fire('Error', err?.error?.message || err.message || 'No se pudieron asignar los permisos.', 'error');
    }
  });
}



  // -----------------------
  // Utilidades / reset
  // -----------------------

  onCancelAddForm(): void {
    this.resetAddFormFlow();
    // Volver al paso anterior
    this.prevStep();
  }

  // -----------------------
  // Gestión bulk de permisos
  // -----------------------

  isPermissionSelectedForFormInBulk(formId: number, permissionId: number): boolean {
    // Primero verificar selecciones bulk
    if (this.bulkSelections[formId]?.includes(permissionId)) {
      return true;
    }

    // Luego verificar permisos existentes del rol
    const form = this.permissionsData?.forms.find(f => f.formId === formId);
    if (form) {
      const permissionName = this.permissions.find(p => p.id === permissionId)?.name;
      return permissionName ? form.permissions?.includes(permissionName) || false : false;
    }

    return false;
  }

  onPermissionChangeForFormInBulk(formId: number, permissionId: number, checked: boolean): void {
    if (!this.bulkSelections[formId]) {
      this.bulkSelections[formId] = [];
    }

    if (checked) {
      if (!this.bulkSelections[formId].includes(permissionId)) {
        this.bulkSelections[formId].push(permissionId);
      }
    } else {
      this.bulkSelections[formId] = this.bulkSelections[formId].filter(id => id !== permissionId);
    }
  }

  hasSelectedPermissions(): boolean {
    // Detectar cambios entre las selecciones actuales (bulkSelections)
    // y las selecciones iniciales (initialSelections). Debe devolver true
    // si hay permisos añadidos o removidos para cualquier formulario.
    const formIds = new Set<string | number>([
      ...Object.keys(this.initialSelections).map(k => k),
      ...Object.keys(this.bulkSelections).map(k => k)
    ]);

    for (const fid of Array.from(formIds)) {
      const id = fid as any;
      const init = this.initialSelections[id] || [];
      const curr = this.bulkSelections[id] || [];

      if (init.length !== curr.length) return true;

      const initSet = new Set(init);
      for (const p of curr) {
        if (!initSet.has(p)) return true;
      }
      // also check removals: if any init id not in curr
      const currSet = new Set(curr);
      for (const p of init) {
        if (!currSet.has(p)) return true;
      }
    }

    return false;
  }

  onSaveBulk(): void {
    const rolId = this.form.get('rolId')?.value as number;
    const requests: any[] = [];

    // Para cada formulario, determinar qué agregar y qué quitar
    Object.keys(this.bulkSelections).forEach(formIdStr => {
      const formId = +formIdStr;
      const currentSelections = this.bulkSelections[formId] || [];
      const initialSelections = this.initialSelections[formId] || [];

      // Permisos a quitar (estaban inicialmente pero ya no)
      const toRemove = initialSelections.filter(id => !currentSelections.includes(id));
      toRemove.forEach(permissionId => {
        requests.push({
          rolId,
          formId,
          permissionId,
          asset: false
        });
      });

      // Permisos a agregar (no estaban inicialmente pero ahora sí)
      const toAdd = currentSelections.filter(id => !initialSelections.includes(id));
      toAdd.forEach(permissionId => {
        requests.push({
          rolId,
          formId,
          permissionId,
          asset: true
        });
      });
    });

    if (!requests.length) {
      Swal.fire('Información', 'No hay cambios en los permisos.', 'info');
      return;
    }

    this.isSaving = true;
    forkJoin(requests.map(req => this.service.post('RolFormPermission', req))).subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire({
          icon: 'success',
          title: 'Permisos asignados exitosamente',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });

        // Limpiar selecciones y recargar
        this.bulkSelections = {};
        this.loadPermissionsForRole(rolId);
        this.router.navigate(['/rolFormPermission-index']);
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

  onCancelBulk(): void {
    this.bulkSelections = {};
    // Resetear a selecciones iniciales
    this.bulkSelections = { ...this.initialSelections };
    this.prevStep();
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
