import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatesForm } from './rates-form';

describe('RatesForm', () => {
  let component: RatesForm;
  let fixture: ComponentFixture<RatesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
