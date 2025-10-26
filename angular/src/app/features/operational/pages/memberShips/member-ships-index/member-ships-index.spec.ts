import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberShipsIndex } from './member-ships-index';

describe('MemberShipsIndex', () => {
  let component: MemberShipsIndex;
  let fixture: ComponentFixture<MemberShipsIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberShipsIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberShipsIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
