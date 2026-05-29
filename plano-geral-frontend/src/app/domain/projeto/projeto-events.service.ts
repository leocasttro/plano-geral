import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({ providedIn: 'root' })

export class ProjetoEventsService {
  private novoProjetoSubject = new Subject<void>();
  novoProjeto$ = this.novoProjetoSubject.asObservable();

  abrirNovoProjeto() {
    this.novoProjetoSubject.next();
  }
}
