// Angular Import
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './layout/admin/admin.component';
import { PersonIndex } from './features/segurity/pages/person/person-index/person-index';
import { PersonPrueba } from './features/segurity/pages/person/person-prueba/person-prueba';
import { RoleIndex } from './features/segurity/pages/role/role-index/role-index';
import { RoleForm } from './features/segurity/pages/role/role-form/role-form';
import { UserIndex } from './features/segurity/pages/user/user-index/user-index';
import { UserForm } from './features/segurity/pages/user/user-form/user-form';
import { ModuleIndex } from './features/segurity/pages/module/module-index/module-index';
import { FormIndex } from './features/segurity/pages/form/form-index/form-index';
import { ModuleForm } from './features/segurity/pages/module/module-form/module-form';
import { FormForm } from './features/segurity/pages/form/form-form/form-form';
import { PermissionForm } from './features/segurity/pages/permission/permission-form/permission-form';
import { PermissionIndex } from './features/segurity/pages/permission/permission-index/permission-index';
import { FormModuleIndex } from './features/segurity/pages/form-module/form-module-index/form-module-index';
import { FormModuleForm } from './features/segurity/pages/form-module/form-module-form/form-module-form';
import { RolFormPerIndex } from './features/segurity/pages/rolFormPermission/rol-form-per-index/rol-form-per-index';
import { ProfileIndex } from './features/segurity/pages/profile/profile-index/profile-index';
import { VehicleTypeForm } from './features/parameters/pages/vehicleType/vehicle-type-form/vehicle-type-form';
import { VehicleTypeIndex } from './features/parameters/pages/vehicleType/vehicle-type-index/vehicle-type-index';
import { RolFormPerForm } from './features/segurity/pages/rolFormPermission/rol-form-per-form/rol-form-per-form';
import { MembershipsTypeIndex } from './features/parameters/pages/membershipsType/memberships-type-index/memberships-type-index';
import { MembershipsTypeForm } from './features/parameters/pages/membershipsType/memberships-type-form/memberships-type-form';
import { RateTypeIndex } from './features/parameters/pages/ratesType/rate-type-index/rate-type-index';
import { RateTypeForm } from './features/parameters/pages/ratesType/rate-type-form/rate-type-form';
import { BackListIndex } from './features/segurity/pages/backlist/back-list-index/back-list-index';
import { ZonesIndex } from './features/parameters/pages/zones/zones-index/zones-index';
import { ZonesForm } from './features/parameters/pages/zones/zones-form/zones-form';
import { ParkingIndex } from './features/parameters/pages/parking/parking-index/parking-index';
import { ParkingForm } from './features/parameters/pages/parking/parking-form/parking-form';
import { ParkingCategoryIndex } from './features/parameters/pages/parkingCategory/parking-category-index/parking-category-index';
import { ParkingCategoryForm } from './features/parameters/pages/parkingCategory/parking-category-form/parking-category-form';
import { SectorsIndex } from './features/parameters/pages/sectors/sectors-index/sectors-index';
import { SectorsForm } from './features/parameters/pages/sectors/sectors-form/sectors-form';
import { SlotsIndex } from './features/parameters/pages/slots/slots-index/slots-index';
import { SlotsForm } from './features/parameters/pages/slots/slots-form/slots-form';
import { VehicleIndex } from './features/operational/pages/vehicles/vehicle-index/vehicle-index';
import { Configuration } from './features/configuration/configuration/configuration';
import { RatesForm } from './features/operational/pages/rates/rates-form/rates-form';
import { RatesIndex } from './features/operational/pages/rates/rates-index/rates-index';
import { MemberShipsForm } from './features/operational/pages/memberShips/member-ships-form/member-ships-form';
import { MemberShipsIndex } from './features/operational/pages/memberShips/member-ships-index/member-ships-index';
import { CameraForm } from './features/cameras/camera-form/camera-form';
import { CameraIndex } from './features/cameras/camera-index/camera-index';
import { BlackListForm } from './features/segurity/pages/backlist/black-list-form/black-list-form';
import { VehicleForm } from './features/operational/pages/vehicles/vehicle-form/vehicle-form';
import { ParkingManagement } from './features/parking/pages/parking-management/parking-management';
import { RegisteredVehicleIndex } from './features/operational/pages/registeredVehicle/registered-vehicle-index/registered-vehicle-index';
import { ClientIndex } from './features/segurity/pages/client/client-index/client-index';
import { ClientForm } from './features/segurity/pages/client/client-form/client-form';
import { HelpCenterComponent } from './features/help/help-center.component';
import { GuestComponent } from './layout/guest/guest.component';
import { SelectParking } from './features/parking/pages/select-parking/select-parking';
import { ResetPasswordComponent } from './features/authentication/pages/reset-password/reset-password';
import { VerifyOtpComponent } from './features/authentication/pages/verify-otp/verify-otp';

// project import


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/dashboard/dash-analytics.component').then((c) => c.DashAnalyticsComponent)
      },
      {
        path: 'persons-index',
        component: PersonIndex
      },
      { path: 'persona-form', component: PersonPrueba },
      { path: 'persona-form/:id', component: PersonPrueba },
       {
        path: 'role-index',
        component: RoleIndex
      },
       { path: 'role-form', component: RoleForm },
      { path: 'role-form/:id', component: RoleForm },
      { path: 'user-index', component: UserIndex },
      { path: 'user-form', component: UserForm },
      { path: 'user-form/:id', component: UserForm },
      { path: 'module-index', component: ModuleIndex },
      { path: 'module-form', component: ModuleForm },
      { path: 'module-form/:id', component: ModuleForm },
      { path: 'form-index', component: FormIndex },
      { path: 'form-form', component: FormForm },
      { path: 'form-form/:id', component: FormForm },
      {path: 'permission-index', component: PermissionIndex},
      {path: 'permission-form', component: PermissionForm},
      {path: 'permission-form/:id', component: PermissionForm},
      {path: 'form-module-index', component: FormModuleIndex},
      {path: 'formModule-form', component: FormModuleForm},
      {path: 'formModule-form/:id', component: FormModuleForm},
      {path: 'rolFormPermission-index', component: RolFormPerIndex},
      {path: 'rolFormPermission-form', component: RolFormPerForm},
      {path: 'rolFormPermission-form/:id', component: RolFormPerForm},
      {path: 'memberShipType-index', component: MembershipsTypeIndex},
      {path: 'memberShipType-form', component: MembershipsTypeForm},
      {path: 'memberShipType-form/:id', component: MembershipsTypeForm},
      {path: 'profile-index', component: ProfileIndex},
      {path: 'TypeVehicle-index', component: VehicleTypeIndex},
      {path: 'TypeVehicle-form', component: VehicleTypeForm},
      {path: 'TypeVehicle-form/:id', component: VehicleTypeForm},
      {path: 'RatesType-index', component: RateTypeIndex},
      {path: 'RatesType-form', component: RateTypeForm},
      {path: 'RatesType-form/:id', component: RateTypeForm},
      {path: 'ParkingCategory-index', component: ParkingCategoryIndex},
      {path: 'ParkingCategory-form', component: ParkingCategoryForm},
      {path: 'ParkingCategory-form/:id', component: ParkingCategoryForm},
      {path: 'BackList-index', component: BackListIndex},
      {path: 'Zones-index', component: ZonesIndex},
      {path: 'Zones-form', component: ZonesForm},
      {path: 'Zones-form/:id', component: ZonesForm},
      {path: 'parking-index', component: ParkingIndex},
      {path: 'parking-form', component: ParkingForm},
      {path: 'parking-form/:id', component: ParkingForm},
      {path: 'sectors-index', component: SectorsIndex},
      {path: 'sectors-form', component: SectorsForm},
      {path: 'sectors-form/:id', component: SectorsForm},
      {path: 'slots-index', component: SlotsIndex},
      {path: 'slots-form', component: SlotsForm},
      {path: 'slots-form/:id', component: SlotsForm},
      {path: 'vehicles-index', component: VehicleIndex},
      {path: 'vehicles-form', component: VehicleForm},
      {path: 'vehicles-form/:id', component: VehicleForm},
      {path: 'parking-management', component: ParkingManagement},
      {path: 'registeredVehicle-index', component: RegisteredVehicleIndex},
      {path: 'client-index', component: ClientIndex},
      {path: 'client-form', component: ClientForm},
      {path: 'client-form/:id', component: ClientForm},
      {path: 'blackList-index', component: BackListIndex},
      {path: 'blackList-form', component: BlackListForm},
      {path: 'blackList-form/:id', component: BlackListForm},
      {path: 'cameras-index', component: CameraIndex},
      {path: 'cameras-form', component: CameraForm},
      {path: 'cameras-form/:id', component: CameraForm},
      {path: 'memberShips-index', component: MemberShipsIndex},
      {path: 'memberShips-form', component: MemberShipsForm},
      {path: 'memberShips-form/:id', component: MemberShipsForm},
      {path: 'rates-index', component: RatesIndex},
      {path: 'rates-form', component: RatesForm},
      {path: 'rates-form/:id', component: RatesForm},
      {path: 'configuracion', component: Configuration},


      {
        path: 'component',
        loadChildren: () => import('./shared/components/ui-element/ui-basic.module').then((m) => m.UiBasicModule)
      },
      // {
      //   path: 'chart',
      //   loadComponent: () => import('./demo/chart-maps/core-apex.component').then((c) => c.CoreApexComponent)
      // },




      {
        path: 'help-center',
        component: HelpCenterComponent
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'register',
        loadComponent: () => import('./features/authentication/pages/sign-up/sign-up.component').then((c) => c.SignUpComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./features/authentication/pages/sign-in/sign-in.component').then((c) => c.SignInComponent)
      },
      {path: 'select-parking', component: SelectParking},
      {path: 'reset-password', component: ResetPasswordComponent},
      {path: 'verify-otp', component: VerifyOtpComponent},

    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
