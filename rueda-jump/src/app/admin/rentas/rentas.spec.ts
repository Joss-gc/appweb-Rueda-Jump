import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rentas } from './rentas';

describe('Rentas', () => {
  let component: Rentas;
  let fixture: ComponentFixture<Rentas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rentas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rentas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
