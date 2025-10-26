import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleIndex } from './vehicle-index';

describe('VehicleIndex', () => {
  let component: VehicleIndex;
  let fixture: ComponentFixture<VehicleIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
