import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackListForm } from './black-list-form';

describe('BlackListForm', () => {
  let component: BlackListForm;
  let fixture: ComponentFixture<BlackListForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlackListForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlackListForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
