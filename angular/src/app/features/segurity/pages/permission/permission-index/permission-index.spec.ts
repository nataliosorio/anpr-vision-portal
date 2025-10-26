import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionIndex } from './permission-index';

describe('PermissionIndex', () => {
  let component: PermissionIndex;
  let fixture: ComponentFixture<PermissionIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
