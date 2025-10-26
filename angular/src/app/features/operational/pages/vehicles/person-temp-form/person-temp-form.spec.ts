import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonTempForm } from './person-temp-form';

describe('PersonTempForm', () => {
  let component: PersonTempForm;
  let fixture: ComponentFixture<PersonTempForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonTempForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonTempForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
