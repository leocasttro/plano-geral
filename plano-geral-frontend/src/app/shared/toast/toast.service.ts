import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastTipo = 'success' | 'error' | 'info' | 'warning';

export interface AppToast {
  id: number;
  tipo: ToastTipo;
  mensagem: string;
  titulo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private proximoId = 1;
  private readonly toastsSubject = new BehaviorSubject<AppToast[]>([]);

  readonly toasts$ = this.toastsSubject.asObservable();

  success(mensagem: string, titulo = 'Alteração salva') {
    this.mostrar(mensagem, 'success', titulo);
  }

  error(mensagem: string, titulo = 'Não foi possível concluir') {
    this.mostrar(mensagem, 'error', titulo, 5000);
  }

  warning(mensagem: string, titulo = 'Atenção') {
    this.mostrar(mensagem, 'warning', titulo, 4500);
  }

  info(mensagem: string, titulo = 'Informação') {
    this.mostrar(mensagem, 'info', titulo);
  }

  mostrar(
    mensagem: string,
    tipo: ToastTipo = 'info',
    titulo?: string,
    duracao = 3500,
  ) {
    const toast: AppToast = {
      id: this.proximoId++,
      tipo,
      mensagem,
      titulo,
    };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    window.setTimeout(() => this.fechar(toast.id), duracao);
  }

  fechar(id: number) {
    this.toastsSubject.next(
      this.toastsSubject.value.filter((toast) => toast.id !== id),
    );
  }
}
