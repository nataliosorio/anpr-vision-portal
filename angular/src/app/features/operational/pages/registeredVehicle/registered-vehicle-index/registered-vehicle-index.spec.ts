import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredVehicleIndex } from './registered-vehicle-index';

describe('RegisteredVehicleIndex', () => {
  let component: RegisteredVehicleIndex;
  let fixture: ComponentFixture<RegisteredVehicleIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisteredVehicleIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisteredVehicleIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
