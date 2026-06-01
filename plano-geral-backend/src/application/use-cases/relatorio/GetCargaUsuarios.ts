import {TarefaRepository} from '../../../domain/repositories/TarefaRepository';
import {UserRepository} from '../../../domain/repositories/UserRepository';
import {StatusTarefa} from '../../../domain/value-objects/StatusTarefa';
import {TarefaComPrazo} from '../../../domain/entities/TarefaComPrazo';
import {CargaUsuarioDTO, RelatorioCargaUsuariosDTO} from '../../dtos/RelatorioCargaUsuariosDTO';

export class GetCargaUsuarios {
  constructor(private tarefaRepository: TarefaRepository, private userRepository: UserRepository) {}

  async execute(): Promise<RelatorioCargaUsuariosDTO> {
    const [tarefas, usuarios] = await Promise.all([
      this.tarefaRepository.list(),
      this.userRepository.findAllActive(),
    ]);

    const usuariosMap = new Map<string, CargaUsuarioDTO>();

    usuarios.forEach((usuario) => {
      usuariosMap.set(usuario.id, {
        usuarioId: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        totalTarefas: 0,
        pendentes: 0,
        emAndamento: 0,
        concluidas: 0,
        atrasadas: 0,
        projetos: 0,
      });
    });

    const projetosPorUsuario = new Map<string, Set<string>>();

    tarefas.forEach((tarefa) => {
      const responsavel = tarefa.obterResponsavel();

      if (!responsavel) return;

      const carga = usuariosMap.get(responsavel);

      if (!carga) return;

      carga.totalTarefas += 1;

      if (tarefa.obterStatus() === StatusTarefa.PENDENTE) {
        carga.pendentes += 1;
      }

      if (tarefa.obterStatus() === StatusTarefa.EM_ANDAMENTO) {
        carga.emAndamento += 1;
      }

      if (tarefa.obterStatus() === StatusTarefa.CONCLUIDA) {
        carga.concluidas += 1;
      }

      if (
        tarefa instanceof TarefaComPrazo &&
        tarefa.obterStatus() !== StatusTarefa.CONCLUIDA &&
        tarefa.estaAtrasada()
      ) {
        carga.atrasadas += 1;
      }

      usuariosMap.forEach((carga, usuarioId) => {
        carga.projetos = projetosPorUsuario.get(usuarioId)?.size ?? 0;
      });
    });

    usuariosMap.forEach((carga, usuarioId) => {
      carga.projetos = projetosPorUsuario.get(usuarioId)?.size ?? 0;
    });

    return {
      totalUsuarios: usuariosMap.size,
      usuarios: Array.from(usuariosMap.values()).sort(
        (a, b) => b.totalTarefas - a.totalTarefas,
      ),
    };
  }
}
