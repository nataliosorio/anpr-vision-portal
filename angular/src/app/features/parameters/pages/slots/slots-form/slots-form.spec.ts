import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotsForm } from './slots-form';

describe('SlotsForm', () => {
  let component: SlotsForm;
  let fixture: ComponentFixture<SlotsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
