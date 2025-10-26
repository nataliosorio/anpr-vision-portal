import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateTypeForm } from './rate-type-form';

describe('RateTypeForm', () => {
  let component: RateTypeForm;
  let fixture: ComponentFixture<RateTypeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateTypeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateTypeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
