import { SolicitacaoAlteracaoDatas } from '../../domain/entities/SolicitacaoAlteracaoDatas';

export type SolicitacaoAlteracaoDatasDTOProps = {
  id: string;
  tarefaId: string;
  solicitanteId: string;
  solicitanteNome: string;
  dataInicio: string | null;
  dataFim: string | null;
  justificativa: string;
  status: string;
  aprovadorId: string | null;
  aprovadorNome: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class SolicitacaoAlteracaoDatasDTO {
  static fromDomain(
    solicitacao: SolicitacaoAlteracaoDatas,
  ): SolicitacaoAlteracaoDatasDTOProps {
    return {
      id: solicitacao.id,
      tarefaId: solicitacao.tarefaId,
      solicitanteId: solicitacao.solicitanteId,
      solicitanteNome: solicitacao.solicitanteNome,
      dataInicio: formatDateOnly(solicitacao.dataInicio),
      dataFim: formatDateOnly(solicitacao.dataFim),
      justificativa: solicitacao.justificativa,
      status: solicitacao.obterStatus(),
      aprovadorId: solicitacao.aprovadorId,
      aprovadorNome: solicitacao.aprovadorNome,
      createdAt: solicitacao.createdAt,
      updatedAt: solicitacao.updatedAt,
    };
  }
}

function formatDateOnly(data: Date | null): string | null {
  if (!data) {
    return null;
  }

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}
