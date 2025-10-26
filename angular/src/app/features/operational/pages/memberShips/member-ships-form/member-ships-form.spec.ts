import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberShipsForm } from './member-ships-form';

describe('MemberShipsForm', () => {
  let component: MemberShipsForm;
  let fixture: ComponentFixture<MemberShipsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberShipsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberShipsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
