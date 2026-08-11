import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ProjetoApi} from '../../domain/projeto/projeto.api';
import { ProjetoDTO } from '../../domain/projeto/projetoModel';
import { TituloTarefaApi } from '../../domain/titulo-tarefa/titulo-tarefa.api';
import { TituloTarefaCatalogoDTO } from '../../domain/titulo-tarefa/titulo-tarefa.model';
import {
  ehSubatividadeTituloManual,
  montarTituloAutomaticoTarefa,
  subatividadeUnicaExigeTituloManual,
} from '../../domain/titulo-tarefa/titulo-tarefa-manual-title';

@Component({
  selector: 'app-modal-cadastro-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './modal-cadastro-tarefa.html',
  styleUrls: ['./modal-cadastro-tarefa.scss'],
})
export class ModalCadastroTarefa implements OnInit{
  titulo = '';
  descricao = '';
  projetoId = '';

  componenteSelecionado = '';
  atividadePrincipalSelecionada = '';
  subatividadeSelecionada = '';

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

    if (subatividadeUnicaExigeTituloManual(this.subatividades)) {
      this.subatividadeSelecionada = this.subatividades[0].subatividade ?? '';
      this.tituloCatalogoSelecionado = this.subatividades[0];
      this.titulo = '';
      return;
    }

    if (itemSemSubatividade && this.subatividades.length === 0) {
      this.tituloCatalogoSelecionado = itemSemSubatividade;
    }

    this.atualizarTitulo();
  }

  onSubatividadeChange(): void {
    this.tituloCatalogoSelecionado =
      this.titulosCatalogo.find(
        (item) =>
          item.componente === this.componenteSelecionado &&
          item.atividadePrincipal === this.atividadePrincipalSelecionada &&
          item.subatividade === this.subatividadeSelecionada,
      ) ?? null;

    if (this.devePreencherTituloManual()) {
      this.titulo = '';
      return;
    }

    this.atualizarTitulo();
  }

  atualizarTitulo(): void {
    if (this.devePreencherTituloManual()) {
      this.titulo = '';
      return;
    }

    this.titulo = montarTituloAutomaticoTarefa(
      this.atividadePrincipalSelecionada,
      this.subatividadeSelecionada,
    );
  }

  salvar() {
    if (!this.devePreencherTituloManual()) {
      this.atualizarTitulo();
    }

    const titulo = this.titulo.trim();

    if (!this.podeSalvar()) return;

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
    return this.ehSubatividadeTituloManual(this.subatividadeSelecionada);
  }

  temSubatividadeUnicaDeTituloManual(): boolean {
    return (
      subatividadeUnicaExigeTituloManual(this.subatividades)
    );
  }

  deveSelecionarSubatividade(): boolean {
    return (
      !!this.atividadePrincipalSelecionada &&
      this.subatividades.length > 0 &&
      !this.temSubatividadeUnicaDeTituloManual()
    );
  }

  podeSalvar(): boolean {
    return (
      !!this.projetoId &&
      !!this.componenteSelecionado &&
      !!this.atividadePrincipalSelecionada &&
      !!this.tituloCatalogoSelecionado &&
      !!this.titulo.trim()
    );
  }

  ehSubatividadeTituloManual(value: string | null | undefined): boolean {
    return ehSubatividadeTituloManual(value);
  }
}
