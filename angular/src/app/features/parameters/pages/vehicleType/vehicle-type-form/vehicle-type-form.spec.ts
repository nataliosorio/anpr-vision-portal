import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleTypeForm } from './vehicle-type-form';

describe('VehicleTypeForm', () => {
  let component: VehicleTypeForm;
  let fixture: ComponentFixture<VehicleTypeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleTypeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleTypeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
