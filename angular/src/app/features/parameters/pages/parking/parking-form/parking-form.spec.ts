import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingForm } from './parking-form';

describe('ParkingForm', () => {
  let component: ParkingForm;
  let fixture: ComponentFixture<ParkingForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
