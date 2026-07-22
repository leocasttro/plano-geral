import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KanbanSearchService {
  private readonly openSearchSubject = new Subject<void>();

  openSearch$ = this.openSearchSubject.asObservable();

  abrirPesquisa(): void {
    this.openSearchSubject.next();
  }
}
