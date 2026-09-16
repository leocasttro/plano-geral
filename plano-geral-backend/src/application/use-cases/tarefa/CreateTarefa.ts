import { Tarefa } from "../../../domain/entities/Tarefa";
import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {TituloTarefaCatalogoRepository} from '../../../domain/repositories/TituloTarefaCatalogoRepository';
import {UserRepository} from '../../../domain/repositories/UserRepository';

export class CreateTarefa {
  constructor(
    private readonly repo: TarefaRepository,
    private readonly projetoRepo: ProjetoRepository,
    private readonly tituloCatalogoRepo: TituloTarefaCatalogoRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(input: {
    titulo: string;
    tituloCatalogoId?: string | null;
    descricao?: string;
    projetoId: string;
    usuario: string;
    usuarioNome: string;
    isMacroTarefa?: boolean;
    tarefaPaiId?: string | null;
  }) {

    const projeto = await this.projetoRepo.findById(input.projetoId);

    if (!projeto) {
      throw new Error("Projeto não encontrado")
    }

    let tituloFinal = input.titulo?.trim();

    if (!input.tituloCatalogoId) {
      throw new Error('Selecione um item do catálogo para criar a tarefa');
    }

    if (input.tituloCatalogoId) {
      const tituloCatalogo = await this.tituloCatalogoRepo.findById(input.tituloCatalogoId);

      if (!tituloCatalogo) {
        throw new Error('Título pré-cadastrado não encontrado');
      }

      if (tituloCatalogo.exigeTituloManual()) {
        if (!tituloFinal) {
          throw new Error('Título manual é obrigatório para este item do catálogo');
        }

        if (tituloCatalogo.correspondeAoTituloAutomaticoComMarcador(tituloFinal)) {
          throw new Error('Informe um título manual válido para a tarefa');
        }
      } else {
        tituloFinal = tituloFinal || tituloCatalogo.obterTituloExibicao();
      }
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

    if (input.isMacroTarefa) {
      tarefa.transformarEmMacroTarefa();
    }

    if (input.tarefaPaiId) {
      tarefa.vincularATarefaPai(input.tarefaPaiId);
    }

    if (input.tituloCatalogoId) {
      const tituloCatalogoObj = await this.tituloCatalogoRepo.findById(input.tituloCatalogoId);
      if (tituloCatalogoObj?.componente?.trim().toLowerCase() === 'geoprocessamento') {
        const users = await this.userRepo.findAllActive();
        const gestorGeo = users.find(u => u.perfil === 'GESTOR_GEOPROCESSAMENTO');
        if (gestorGeo) {
          tarefa.atribuirResponsavel(gestorGeo.id, input.usuarioNome, gestorGeo.nome);
        }
      }
    }

    tarefa.definirProjeto({
      id: projeto.id,
      nome: projeto.nome,
    });

    tarefa.registrarCriacao(input.usuario, input.usuarioNome);

    await this.repo.save(tarefa);

    return tarefa;
  }
}
