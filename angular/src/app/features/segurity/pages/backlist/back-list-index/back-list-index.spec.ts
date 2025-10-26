import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackListIndex } from './back-list-index';

describe('BackListIndex', () => {
  let component: BackListIndex;
  let fixture: ComponentFixture<BackListIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackListIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackListIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
