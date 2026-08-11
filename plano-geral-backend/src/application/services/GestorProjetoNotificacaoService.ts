import { Projeto } from '../../domain/entities/Projeto';
import { Tarefa } from '../../domain/entities/Tarefa';
import { User } from '../../domain/entities/User';
import { ProjetoRepository } from '../../domain/repositories/ProjetoRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { StatusTarefa } from '../../domain/value-objects/StatusTarefa';
import { MailService } from './MailService';
import { NotificacaoService } from './NotificacaoService';

export class GestorProjetoNotificacaoService {
  constructor(
    private projetoRepository: ProjetoRepository,
    private userRepository: UserRepository,
    private notificacaoService?: NotificacaoService,
    private mailService?: MailService,
  ) {}

  async notificarAndamentoTarefa(input: {
    tarefa: Tarefa;
    novoStatus: StatusTarefa;
    usuarioNome: string;
    usuarioId?: string;
  }): Promise<void> {
    const destinatario = await this.obterGestorProjeto(input.tarefa, input.usuarioId);

    if (!destinatario) return;

    const { gestor, projeto } = destinatario;
    const statusLabel = this.obterStatusLabel(input.novoStatus);
    const titulo = `Andamento de tarefa: ${statusLabel}`;
    const mensagem = `A tarefa "${input.tarefa.titulo}" do projeto "${projeto.nome}" foi atualizada para ${statusLabel} por ${input.usuarioNome}.`;
    const link = `/tarefas/${input.tarefa.id}`;

    if (this.notificacaoService) {
      await this.notificacaoService.notificarUsuario({
        usuarioId: gestor.id,
        tipo: 'TAREFA_ANDAMENTO',
        titulo,
        mensagem,
        link,
        autorId: input.usuarioId ?? '',
      });
    }

    await this.enviarEmailGestor({
      gestorNome: gestor.nome,
      gestorEmail: gestor.email,
      titulo,
      mensagem,
      link,
      detalhes: `Status: ${statusLabel}`,
    });
  }

  async notificarSolicitacaoAlteracaoDatas(input: {
    tarefa: Tarefa;
    solicitacaoId: string;
    solicitanteNome: string;
    solicitanteId?: string;
  }): Promise<void> {
    const destinatario = await this.obterGestorProjeto(input.tarefa, input.solicitanteId);

    if (!destinatario) return;

    const { gestor, projeto } = destinatario;
    const titulo = 'Solicitação de alteração de datas';
    const mensagem = `${input.solicitanteNome} solicitou alteração de datas na tarefa "${input.tarefa.titulo}" do projeto "${projeto.nome}".`;
    const link = `/tarefas/${input.tarefa.id}/solicitacoes-datas/${input.solicitacaoId}`;

    await this.enviarEmailGestor({
      gestorNome: gestor.nome,
      gestorEmail: gestor.email,
      titulo,
      mensagem,
      link,
    });
  }

  async notificarComentarioRelevante(input: {
    tarefa: Tarefa;
    comentario: string;
    usuarioNome: string;
    usuarioId?: string;
  }): Promise<void> {
    const destinatario = await this.obterGestorProjeto(input.tarefa, input.usuarioId);

    if (!destinatario) return;

    const { gestor, projeto } = destinatario;
    const titulo = 'Comentário em tarefa do projeto';
    const mensagem = `${input.usuarioNome} comentou na tarefa "${input.tarefa.titulo}" do projeto "${projeto.nome}".`;
    const link = `/tarefas/${input.tarefa.id}`;

    if (this.notificacaoService) {
      await this.notificacaoService.notificarUsuario({
        usuarioId: gestor.id,
        tipo: 'COMENTARIO_TAREFA',
        titulo,
        mensagem,
        link,
        autorId: input.usuarioId ?? '',
      });
    }

    await this.enviarEmailGestor({
      gestorNome: gestor.nome,
      gestorEmail: gestor.email,
      titulo,
      mensagem,
      link,
      detalhes: `Comentário: ${input.comentario}`,
    });
  }

  private async obterGestorProjeto(
    tarefa: Tarefa,
    autorId?: string,
  ): Promise<{ gestor: User; projeto: Projeto } | null> {
    const projeto = await this.projetoRepository.findById(tarefa.obterProjetoId());
    const gestorId = projeto?.obterCoordenadorId();

    if (!projeto || !gestorId || gestorId === autorId) return null;

    const gestor = await this.userRepository.findById(gestorId);

    if (!gestor || !gestor.ativo) return null;

    return { gestor, projeto };
  }

  private async enviarEmailGestor(input: {
    gestorNome: string;
    gestorEmail: string;
    titulo: string;
    mensagem: string;
    link?: string;
    detalhes?: string;
  }): Promise<void> {
    if (!this.mailService || !input.gestorEmail) return;

    const detalhesHtml = input.detalhes
      ? `<p><strong>Detalhes:</strong> ${this.escaparHtml(input.detalhes)}</p>`
      : '';
    const linkHtml = input.link
      ? `<p><a href="${this.escaparHtml(input.link)}">Abrir no sistema</a></p>`
      : '';

    await this.mailService.send({
      to: input.gestorEmail,
      subject: `[Prosul] ${input.titulo}`,
      text: input.detalhes
        ? `${input.mensagem}\n\n${input.detalhes}`
        : input.mensagem,
      html: `
        <p>Olá, ${this.escaparHtml(input.gestorNome)}.</p>
        <p>${this.escaparHtml(input.mensagem)}</p>
        ${detalhesHtml}
        ${linkHtml}
      `,
    });
  }

  private obterStatusLabel(status: StatusTarefa): string {
    switch (status) {
      case StatusTarefa.EM_ANDAMENTO:
        return 'Em andamento';
      case StatusTarefa.CONCLUIDA:
        return 'Concluída';
      case StatusTarefa.PENDENTE:
      default:
        return 'Pendente';
    }
  }

  private escaparHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
