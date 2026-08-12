import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import {
  CardComponent,
  CardData,
  ChecklistItem,
} from '../../shared/components/card-component/card-component';
import { TarefaApi } from '../../domain/tarefa/tarefa.api';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ModalCadastroTarefa } from '../../shared/modals/modal-cadastro-tarefa';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { TarefaDrawersComponent } from '../../shared/drawers/tarefa-drawers-component';
import { tarefaDtoToCardData } from './planoGeral.mapper';
import { KanbanSearchService } from '../../shared/services/kanban-search.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { tarefaDtoToDrawer } from '../../shared/drawers/tarefa-drawer.mapper';
import { TarefaDrawerNavigationService } from '../../shared/services/tarefa-drawer-navigation.service';
import { ToastService } from '../../shared/toast/toast.service';
import { AuthService } from '../../domain/auth/auth.service';
import { FiltrosOperacionaisComponent } from '../../shared/components/filtros-operacionais/filtros-operacionais';
import { FiltrosOperacionais } from '../../shared/components/filtros-operacionais/filtros-operacionais.model';
import { ProjetoApi } from '../../domain/projeto/projeto.api';
import { ProjetoDTO } from '../../domain/projeto/projetoModel';
import { UsuarioApi } from '../../domain/usuario/usuario.api';
import { UsuarioDTO } from '../../domain/usuario/usuario.model';
import { TituloTarefaApi } from '../../domain/titulo-tarefa/titulo-tarefa.api';
import { TituloTarefaCatalogoDTO } from '../../domain/titulo-tarefa/titulo-tarefa.model';

@Component({
  selector: 'app-planoGeral',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    FontAwesomeModule,
    FormsModule,
    FiltrosOperacionaisComponent,
  ],
  templateUrl: './planoGeral.html',
  styleUrl: './planoGeral.scss',
})
export class Pedidos implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;

  tarefasPendentes: CardData[] = [];
  tarefasEmAndamento: CardData[] = [];
  tarefasConcluidas: CardData[] = [];
  tarefasTeste: CardData[] = [];
  tarefas: CardData[] = [];
  mostrarFiltrosTarefas = false;
  filtrosTarefas: FiltrosOperacionais = {};
  projetosFiltro: ProjetoDTO[] = [];
  usuariosFiltro: UsuarioDTO[] = [];
  catalogosFiltro: TituloTarefaCatalogoDTO[] = [];

  faPlus = faPlus;

  private itemSelecionadoParaUpload: ChecklistItem | null = null;
  private filtersSub?: Subscription;
  private drawerNavigationSub?: Subscription;

  constructor(
    private tarefaApi: TarefaApi,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    private kanbanSearch: KanbanSearchService,
    private tarefaDrawerNavigation: TarefaDrawerNavigationService,
    private toast: ToastService,
    private authService: AuthService,
    private projetoApi: ProjetoApi,
    private usuarioApi: UsuarioApi,
    private tituloTarefaApi: TituloTarefaApi,
  ) {}

  ngOnInit(): void {
    this.filtersSub = this.kanbanSearch.toggleFilters$.subscribe(() => {
      this.alternarFiltros();
    });
    this.drawerNavigationSub = this.tarefaDrawerNavigation.abrirTarefa$.subscribe(
      ({ tarefaId, solicitacaoAlteracaoDatasId }) =>
        this.abrirDetalheTarefaPorId(tarefaId, solicitacaoAlteracaoDatasId),
    );
    this.carregarTarefas();
    this.carregarFiltros();
  }

  ngOnDestroy(): void {
    this.filtersSub?.unsubscribe();
    this.drawerNavigationSub?.unsubscribe();
  }

  carregarTarefas(): void {
    this.tarefaApi.buscarTodos().subscribe({
      next: (tarefasDto) => {
        this.tarefasPendentes = [];
        this.tarefasEmAndamento = [];
        this.tarefasConcluidas = [];
        this.tarefasTeste = [];

        tarefasDto.forEach((t) => {
          const card = tarefaDtoToCardData(t);
          const status = String(card.status ?? '').toUpperCase();

          if (status === 'PENDENTE') this.tarefasPendentes.push(card);
          else if (status === 'EM_ANDAMENTO')
            this.tarefasEmAndamento.push(card);
          else if (status === 'CONCLUIDA') this.tarefasConcluidas.push(card);
          else this.tarefasTeste.push(card);
        });

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  carregarFiltros(): void {
    if (!this.podeFiltrarTarefas()) {
      return;
    }

    forkJoin({
      projetos: this.projetoApi.buscarTodos().pipe(
        catchError((err) => {
          console.error('Erro ao buscar projetos para filtros:', err);
          return of([]);
        }),
      ),
      usuarios: this.usuarioApi.buscarTodos().pipe(
        catchError((err) => {
          console.error('Erro ao buscar usuários para filtros:', err);
          return of([]);
        }),
      ),
      catalogos: this.tituloTarefaApi.listar().pipe(
        catchError((err) => {
          console.error('Erro ao buscar catálogo para filtros:', err);
          return of([]);
        }),
      ),
    })
      .pipe(take(1))
      .subscribe(({ projetos, usuarios, catalogos }) => {
        this.projetosFiltro = projetos;
        this.usuariosFiltro = usuarios;
        this.catalogosFiltro = catalogos;
        this.cdr.detectChanges();
      });
  }

  filtrosAtivos(): boolean {
    return this.filtrosTarefasAtivos();
  }

  alternarFiltros(): void {
    if (!this.podeFiltrarTarefas()) {
      return;
    }

    const deveMostrarFiltros = !this.mostrarFiltrosTarefas;
    this.mostrarFiltrosTarefas = deveMostrarFiltros;

    if (!deveMostrarFiltros) {
      this.filtrosTarefas = {};
    }

    this.cdr.detectChanges();
  }

  podeFiltrarTarefas(): boolean {
    const perfil = this.authService.usuario()?.perfil?.toUpperCase();
    return perfil === 'ADMIN' || perfil === 'MANAGER' || perfil === 'GESTOR';
  }

  filtrosTarefasAtivos(): boolean {
    return Object.values(this.filtrosTarefas).some((valor) => !!valor);
  }

  atualizarFiltrosTarefas(filtros: FiltrosOperacionais): void {
    this.filtrosTarefas = filtros;
    this.mostrarFiltrosTarefas = this.filtrosTarefasAtivos() || this.mostrarFiltrosTarefas;
  }

  filtrarTarefas(tarefas: CardData[]): CardData[] {
    return tarefas.filter((tarefa) => this.tarefaDentroDosFiltros(tarefa));
  }

  onNovaTarefa(): void {
    const modalRef = this.modalService.open(ModalCadastroTarefa, {
      centered: true,
      size: 'lg',
    });

    modalRef.result.then(
      (novaTarefa) => {
        if (novaTarefa) {
          this.tarefaApi.criar(novaTarefa).subscribe({
            next: (tarefaDto) => {
              const card = tarefaDtoToCardData(tarefaDto);
              this.tarefasPendentes.push(card);
              this.cdr.detectChanges();
            },
          });
        }
      },
      () => undefined,
    );
  }

  onTarefaAtualizada(tarefaAtualizada: CardData) {
    const patch = (list: CardData[]) =>
      (list ?? []).map((t) =>
        t.id === tarefaAtualizada.id ? { ...tarefaAtualizada } : t,
      );

    this.tarefasPendentes = patch(this.tarefasPendentes);
    this.tarefasEmAndamento = patch(this.tarefasEmAndamento);
    this.tarefasConcluidas = patch(this.tarefasConcluidas);
    this.tarefasTeste = patch(this.tarefasTeste);

    this.cdr.detectChanges();
  }

  onTarefaExcluida(tarefaId: string): void {
    const remover = (list: CardData[]) =>
      (list ?? []).filter((tarefa) => tarefa.id !== tarefaId);

    this.tarefasPendentes = remover(this.tarefasPendentes);
    this.tarefasEmAndamento = remover(this.tarefasEmAndamento);
    this.tarefasConcluidas = remover(this.tarefasConcluidas);
    this.tarefasTeste = remover(this.tarefasTeste);

    this.cdr.detectChanges();
  }

  handleChecklistItemClick(item: ChecklistItem): void {
    this.itemSelecionadoParaUpload = item;
    this.fileInput.nativeElement.click();
  }

  drop(event: CdkDragDrop<CardData[]>, novoStatus: string): void {
    if (this.filtrosAtivos()) {
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      return;
    }

    const tarefaMovida = event.previousContainer.data[event.previousIndex];
    const statusNovo = String(novoStatus).toUpperCase();
    const statusAnterior = tarefaMovida.status;

    if (!this.podeMoverParaStatus(tarefaMovida, statusNovo)) {
      this.toast.warning(
        'Defina responsável, data de início e data de fim antes de mover a tarefa.',
        'Movimentação bloqueada',
      );
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    tarefaMovida.status = statusNovo;

    if (!tarefaMovida.id) return;

    this.tarefaApi
      .atualizarStatus(tarefaMovida.id, statusNovo)
      .subscribe({
        next: (tarefaAtualizada) => {
          tarefaMovida.status = String(tarefaAtualizada.status).toUpperCase();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);

          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex,
          );

          tarefaMovida.status = statusAnterior;
          this.toast.error(
            err.error?.error ?? err.error?.message ?? 'Erro ao alterar status da tarefa.',
          );
          this.cdr.detectChanges();
        },
      });
  }

  private podeMoverParaStatus(tarefa: CardData, novoStatus: string): boolean {
    if (novoStatus !== 'EM_ANDAMENTO' && novoStatus !== 'CONCLUIDA') {
      return true;
    }

    return !!(
      (tarefa.responsavelId || tarefa.responsavel?.id) &&
      tarefa.dataInicio &&
      tarefa.dataFim
    );
  }

  abrirDetalheTarefa(
    tarefa: CardData,
    solicitacaoAlteracaoDatasId?: string | null,
  ): void {
    const ref = this.offcanvasService.open(TarefaDrawersComponent, {
      position: 'end',
      backdrop: true,
      scroll: true,
      panelClass: 'issue-offcanvas',
    });

    ref.componentInstance.tarefa = { ...tarefa };
    ref.componentInstance.solicitacaoAlteracaoDatasId =
      solicitacaoAlteracaoDatasId ?? null;
    ref.componentInstance.tarefaAtualizada.subscribe(
      (tarefaAtualizada: CardData) => {
        this.onTarefaAtualizada(tarefaAtualizada);
      },
    );
    ref.componentInstance.tarefaExcluida.subscribe((tarefaId: string) => {
      this.onTarefaExcluida(tarefaId);
    });
  }

  abrirDetalheTarefaPorId(
    tarefaId: string,
    solicitacaoAlteracaoDatasId?: string | null,
  ): void {
    const tarefaLocal = this.encontrarTarefaPorId(tarefaId);

    if (tarefaLocal) {
      this.abrirDetalheTarefa(tarefaLocal, solicitacaoAlteracaoDatasId);
      return;
    }

    this.tarefaApi.buscarPorId(tarefaId).subscribe({
      next: (tarefaDto) => {
        const tarefaDrawer = tarefaDtoToDrawer(tarefaDto);
        this.abrirDetalheTarefa(tarefaDrawer, solicitacaoAlteracaoDatasId);
      },
      error: (err) => {
        console.error('Erro ao abrir tarefa da notificação:', err);
      },
    });
  }

  private encontrarTarefaPorId(tarefaId: string): CardData | null {
    return [
      ...this.tarefasPendentes,
      ...this.tarefasEmAndamento,
      ...this.tarefasConcluidas,
      ...this.tarefasTeste,
    ].find((tarefa) => tarefa.id === tarefaId) ?? null;
  }

  private normalizarTexto(valor?: string | null): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private tarefaDentroDosFiltros(tarefa: CardData): boolean {
    if (!this.filtrosTarefasAtivos()) {
      return true;
    }

    if (this.filtrosTarefas.projetoId && tarefa.projetoId !== this.filtrosTarefas.projetoId) {
      return false;
    }

    const responsavelId = tarefa.responsavelId || tarefa.responsavel?.id || '';
    if (this.filtrosTarefas.usuarioId && responsavelId !== this.filtrosTarefas.usuarioId) {
      return false;
    }

    const catalogo = this.catalogoDaTarefa(tarefa);

    if (!this.textoCatalogoIgual(catalogo?.componente, this.filtrosTarefas.componente)) {
      return false;
    }

    if (!this.textoCatalogoIgual(catalogo?.atividadePrincipal, this.filtrosTarefas.atividadePrincipal)) {
      return false;
    }

    if (!this.textoCatalogoIgual(catalogo?.subatividade, this.filtrosTarefas.subatividade)) {
      return false;
    }

    if (!this.tarefaDentroDoPeriodo(tarefa)) {
      return false;
    }

    return true;
  }

  private tarefaDentroDoPeriodo(tarefa: CardData): boolean {
    if (!this.filtrosTarefas.inicio && !this.filtrosTarefas.fim) {
      return true;
    }

    const inicioFiltro = this.filtrosTarefas.inicio ? this.dataLocal(this.filtrosTarefas.inicio) : null;
    const fimFiltro = this.filtrosTarefas.fim ? this.dataLocal(this.filtrosTarefas.fim, true) : null;
    const dataInicio = tarefa.dataInicio ? this.dataLocal(tarefa.dataInicio) : null;
    const dataFim = tarefa.dataFim ? this.dataLocal(tarefa.dataFim, true) : dataInicio;

    if (!dataInicio && !dataFim) {
      return false;
    }

    const tarefaInicio = dataInicio ?? dataFim!;
    const tarefaFim = dataFim ?? dataInicio!;

    if (inicioFiltro && tarefaFim < inicioFiltro) {
      return false;
    }

    if (fimFiltro && tarefaInicio > fimFiltro) {
      return false;
    }

    return true;
  }

  private textoCatalogoIgual(valor: string | null | undefined, filtro?: string): boolean {
    if (!filtro?.trim()) {
      return true;
    }

    return this.normalizarTexto(valor) === this.normalizarTexto(filtro);
  }

  private catalogoDaTarefa(tarefa: CardData): TituloTarefaCatalogoDTO | undefined {
    return (
      this.catalogosFiltro.find((item) => item.id === tarefa.tituloCatalogoId) ??
      this.catalogosFiltro.find(
        (item) => this.normalizarTexto(item.tituloExibicao) === this.normalizarTexto(tarefa.titulo),
      )
    );
  }

  private dataLocal(valor: string, fimDoDia = false): Date {
    return new Date(`${valor.slice(0, 10)}T${fimDoDia ? '23:59:59.999' : '00:00:00.000'}`);
  }
}
