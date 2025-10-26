import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleTypeIndex } from './vehicle-type-index';

describe('VehicleTypeIndex', () => {
  let component: VehicleTypeIndex;
  let fixture: ComponentFixture<VehicleTypeIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleTypeIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleTypeIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
