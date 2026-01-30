type CheckListItemProps = {
  id: string;
  nome: string;
  concluido: boolean;
};

export class CheckListItem {
  private concluido: boolean;

  constructor(
    public readonly id: string,
    public nome: string,
    concluido: boolean = false,
  ) {
    if (!nome || nome.trim().length === 0) {
      throw new Error('CheckList precisa de um nome válido');
    }
    if (nome.length > 250) {
      throw new Error('Check list deve ter no máximo 250 caracteres');
    }

    this.concluido = concluido;
  }

  static reconstituir(props: CheckListItemProps) {
    return new CheckListItem(props.id, props.nome, props.concluido);
  }

  marcarConcluido() {
    this.concluido = true;
  }

  marcarPendente() {
    this.concluido = false;
  }

  toggle() {
    this.concluido = !this.concluido;
  }

  isConcluido(): boolean {
    return this.concluido;
  }
}
