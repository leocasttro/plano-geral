export class CheckListItem {
  private concluido: boolean = false;

  constructor( public readonly id: string, public readonly nome: string ) {
    if (!nome || nome.trim().length === 0) {
      throw new Error('CheckList precisa de um nome válido');
    }
  }

  marcarConcluido() {
    this.concluido = true;
  }

  marcarPendente() {
    this.concluido = false;
  }

  isConcluido(): boolean {
    return this.concluido;
  }
}
