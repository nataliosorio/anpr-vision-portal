import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorsForm } from './sectors-form';

describe('SectorsForm', () => {
  let component: SectorsForm;
  let fixture: ComponentFixture<SectorsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
