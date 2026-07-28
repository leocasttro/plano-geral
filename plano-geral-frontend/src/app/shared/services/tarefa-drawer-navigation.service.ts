import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type AbrirTarefaDrawerPayload = {
  tarefaId: string;
  solicitacaoAlteracaoDatasId?: string | null;
};

@Injectable({ providedIn: 'root' })
export class TarefaDrawerNavigationService {
  private readonly abrirTarefaSubject = new Subject<AbrirTarefaDrawerPayload>();

  abrirTarefa$ = this.abrirTarefaSubject.asObservable();

  abrirTarefa(
    tarefaId: string,
    solicitacaoAlteracaoDatasId?: string | null,
  ): void {
    if (!tarefaId.trim()) {
      return;
    }

    this.abrirTarefaSubject.next({
      tarefaId,
      solicitacaoAlteracaoDatasId: solicitacaoAlteracaoDatasId ?? null,
    });
  }
}
