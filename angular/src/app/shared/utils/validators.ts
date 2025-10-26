//validaciones genericas para los campos en los formularios para integrarlas en FormGroup


import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isEmail, isRequired, maxLength, minLength } from './validatorsSimples';

// Versión Angular: Required
export const requiredValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    return isRequired(control.value) ? null : { required: true };
  };
};

// Versión Angular: Longitud mínima
export const minLengthValidator = (min: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    return minLength(control.value, min) ? null : { minLength: { requiredLength: min } };
  };
};

// Versión Angular: Longitud máxima
export const maxLengthValidator = (max: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    return maxLength(control.value, max) ? null : { maxLength: { requiredLength: max } };
  };
};

// Email válido
export const emailValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    return isEmail(control.value) ? null : { email: true };
  };
};


