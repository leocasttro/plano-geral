import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ProjetoApi} from '../../domain/projeto/projeto.api';
import { ProjetoDTO } from '../../domain/projeto/projetoModel';
import { TituloTarefaApi } from '../../domain/titulo-tarefa/titulo-tarefa.api';
import { TituloTarefaCatalogoDTO } from '../../domain/titulo-tarefa/titulo-tarefa.model';

@Component({
  selector: 'app-modal-cadastro-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './modal-cadastro-tarefa.html',
  styleUrls: ['./modal-cadastro-tarefa.scss'],
})
export class ModalCadastroTarefa implements OnInit{
  private readonly subatividadeTituloManual =
    'Abrir campo para preenchimento pelo responsável';

  titulo = '';
  descricao = '';
  projetoId = '';

  componenteSelecionado = '';
  atividadePrincipalSelecionada = '';
  subatividadeSelecionada = '';
  subatividadeManual = '';

  titulosCatalogo: TituloTarefaCatalogoDTO[] = [];
  componentes: string[] = [];
  atividadesPrincipais: string[] = [];
  subatividades: TituloTarefaCatalogoDTO[] = [];
  tituloCatalogoSelecionado: TituloTarefaCatalogoDTO | null = null;
  carregandoTitulos = false;
  erroTitulos = '';

  projetos: ProjetoDTO[] = [];
  carregandoProjetos = false;
  erroProjetos = '';

  constructor(
    public activeModal: NgbActiveModal,
    private projetoApi: ProjetoApi,
    private tituloTarefaApi: TituloTarefaApi,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.carregarProjetos();
    this.carregarCatalogoTitulos();
  }

  carregarProjetos(): void {
    this.carregandoProjetos = true;

    this.projetoApi.buscarTodos().subscribe({
      next: (projetos) => {
        this.projetos = projetos;
        this.projetoId = this.projetos[0]?.id ?? '';
        this.carregandoProjetos = false;
        this.cdr.detectChanges();
      }, error: (err) => {
        this.erroProjetos = 'Erro ao carregar projetos';
        this.carregandoProjetos = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarCatalogoTitulos(): void {
    this.carregandoTitulos = true;
    this.erroTitulos = '';

    this.tituloTarefaApi.listar().subscribe({
      next: (titulos) => {
        this.titulosCatalogo = this.normalizarCatalogo(titulos);
        this.componentes = this.valoresUnicos(
          this.titulosCatalogo.map((item) => item.componente),
        );
        this.carregandoTitulos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.titulosCatalogo = [];
        this.componentes = [];
        this.erroTitulos = 'Erro ao carregar títulos pré-cadastrados';
        this.carregandoTitulos = false;
        this.cdr.detectChanges();
      },
    });
  }

  onComponenteChange(): void {
    this.atividadePrincipalSelecionada = '';
    this.subatividadeSelecionada = '';
    this.subatividadeManual = '';
    this.tituloCatalogoSelecionado = null;

    const titulosDoComponente = this.titulosCatalogo.filter(
      (item) => item.componente === this.componenteSelecionado,
    );

    this.atividadesPrincipais = this.valoresUnicos(
      titulosDoComponente.map((item) => item.atividadePrincipal),
    );

    this.subatividades = [];
    this.atualizarTitulo();
  }

  onAtividadePrincipalChange(): void {
    this.subatividadeSelecionada = '';
    this.subatividadeManual = '';
    this.titulo = '';
    this.tituloCatalogoSelecionado = null;

    const titulosDaAtividade = this.titulosCatalogo.filter(
      (item) =>
        item.componente === this.componenteSelecionado &&
        item.atividadePrincipal === this.atividadePrincipalSelecionada,
    );

    this.subatividades = titulosDaAtividade.filter(
      (item) => !!item.subatividade?.trim(),
    );

    const itemSemSubatividade = titulosDaAtividade.find(
      (item) => !item.subatividade?.trim(),
    );

    const itemTituloManual = this.obterItemTituloManual();

    if (itemTituloManual) {
      this.tituloCatalogoSelecionado = itemTituloManual;
      return;
    }

    if (itemSemSubatividade && this.subatividades.length === 0) {
      this.tituloCatalogoSelecionado = itemSemSubatividade;
    }

    this.atualizarTitulo();
  }

  onSubatividadeChange(): void {
    this.subatividadeManual = '';

    this.tituloCatalogoSelecionado =
      this.titulosCatalogo.find(
        (item) =>
          item.componente === this.componenteSelecionado &&
          item.atividadePrincipal === this.atividadePrincipalSelecionada &&
          item.subatividade === this.subatividadeSelecionada,
      ) ?? null;

    this.atualizarTitulo();
  }

  onSubatividadeManualChange(): void {
    this.subatividadeSelecionada = '';
    this.tituloCatalogoSelecionado = null;
    this.atualizarTitulo();
  }

  atualizarTitulo(): void {
    if (this.devePreencherTituloManual()) {
      return;
    }

    const partes = [
      this.atividadePrincipalSelecionada,
      this.subatividadeSelecionada || this.subatividadeManual,
    ].filter((item) => !!item?.trim());

    this.titulo = partes.join(' - ');
  }

  salvar() {
    if (!this.devePreencherTituloManual()) {
      this.atualizarTitulo();
    }

    const titulo = this.titulo.trim();

    if (!titulo) return;

    this.activeModal.close({
      titulo,
      tituloCatalogoId: this.tituloCatalogoSelecionado?.id ?? null,
      descricao: this.descricao,
      projetoId: this.projetoId,
    });
  }

  private valoresUnicos(valores: Array<string | null>): string[] {
    return [
      ...new Set(
        valores
          .map((item) => item?.trim())
          .filter((item): item is string => !!item),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }

  private normalizarCatalogo(
    titulos: TituloTarefaCatalogoDTO[],
  ): TituloTarefaCatalogoDTO[] {
    let ultimaAcao: string | null = null;
    let ultimoComponente: string | null = null;
    let ultimaAtividadePrincipal: string | null = null;

    return titulos.map((item) => {
      ultimaAcao = item.acao?.trim() || ultimaAcao;
      ultimoComponente = item.componente?.trim() || ultimoComponente;
      ultimaAtividadePrincipal =
        item.atividadePrincipal?.trim() || ultimaAtividadePrincipal;

      return {
        ...item,
        acao: item.acao?.trim() || ultimaAcao,
        componente: item.componente?.trim() || ultimoComponente,
        atividadePrincipal:
          item.atividadePrincipal?.trim() || ultimaAtividadePrincipal,
        subatividade: item.subatividade?.trim() || null,
      };
    });
  }

  devePreencherTituloManual(): boolean {
    return !!this.obterItemTituloManual();
  }

  private obterItemTituloManual(): TituloTarefaCatalogoDTO | null {
    if (this.subatividades.length !== 1) {
      return null;
    }

    const [item] = this.subatividades;

    return this.ehSubatividadeTituloManual(item.subatividade) ? item : null;
  }

  private ehSubatividadeTituloManual(value: string | null): boolean {
    return (
      value?.trim().toLowerCase() ===
      this.subatividadeTituloManual.toLowerCase()
    );
  }
}
