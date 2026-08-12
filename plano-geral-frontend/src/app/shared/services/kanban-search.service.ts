import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KanbanSearchService {
  private readonly toggleFiltersSubject = new Subject<void>();

  toggleFilters$ = this.toggleFiltersSubject.asObservable();

  alternarFiltros(): void {
    this.toggleFiltersSubject.next();
  }
}
