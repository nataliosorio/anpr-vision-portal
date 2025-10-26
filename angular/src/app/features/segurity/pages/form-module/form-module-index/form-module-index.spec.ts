import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormModuleIndex } from './form-module-index';

describe('FormModuleIndex', () => {
  let component: FormModuleIndex;
  let fixture: ComponentFixture<FormModuleIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormModuleIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormModuleIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
