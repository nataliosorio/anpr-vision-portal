import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipsTypeForm } from './memberships-type-form';

describe('MembershipsTypeForm', () => {
  let component: MembershipsTypeForm;
  let fixture: ComponentFixture<MembershipsTypeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipsTypeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembershipsTypeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
