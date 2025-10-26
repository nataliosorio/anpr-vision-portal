import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingCategoryForm } from './parking-category-form';

describe('ParkingCategoryForm', () => {
  let component: ParkingCategoryForm;
  let fixture: ComponentFixture<ParkingCategoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingCategoryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingCategoryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
