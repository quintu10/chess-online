import { TestBed } from '@angular/core/testing';

import { ChessEngine } from './chess-engine';

describe('ChessEngine', () => {
  let service: ChessEngine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessEngine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
