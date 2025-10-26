export interface RolFormPermission {
  id: number;
  rolId: number;
  permissionId: number;
  formId: number;
  rolName: string;
  permissionName: string;
  formName: string;
  asset: boolean;
  isDeleted: boolean;
}
