import { Tarefa } from "../../../domain/entities/Tarefa";
import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {TituloTarefaCatalogoRepository} from '../../../domain/repositories/TituloTarefaCatalogoRepository';

export class CreateTarefa {
  constructor(
    private readonly repo: TarefaRepository,
    private readonly projetoRepo: ProjetoRepository,
    private readonly tituloCatalogoRepo: TituloTarefaCatalogoRepository,
  ) {}

  async execute(input: {
    titulo: string;
    tituloCatalogoId?: string | null;
    descricao?: string;
    projetoId: string;
    usuario: string;
    usuarioNome: string
  }) {

    const projeto = await this.projetoRepo.findById(input.projetoId);

    if (!projeto) {
      throw new Error("Projeto não encontrado")
    }

    let tituloFinal = input.titulo?.trim();

    if (input.tituloCatalogoId) {
      const tituloCatalogo = await this.tituloCatalogoRepo.findById(input.tituloCatalogoId);

      if (!tituloCatalogo) {
        throw new Error('Título pré-cadastrado não encontrado');
      }

      tituloFinal = tituloFinal || tituloCatalogo.obterTituloExibicao();
    }

    if (!tituloFinal) {
      throw new Error('Tarefa precisa de um título válido');
    }

    const tarefa = new Tarefa(
      crypto.randomUUID(),
      tituloFinal,
      input.descricao,
      input.projetoId,
      input.tituloCatalogoId ?? null,
    );

    tarefa.definirProjeto({
      id: projeto.id,
      nome: projeto.nome,
    });

    tarefa.registrarCriacao(input.usuario, input.usuarioNome);

    await this.repo.save(tarefa);

    return tarefa;
  }
}
