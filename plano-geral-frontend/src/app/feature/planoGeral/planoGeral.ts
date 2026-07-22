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
import { Subscription } from 'rxjs';

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
  ],
  templateUrl: './planoGeral.html',
  styleUrl: './planoGeral.scss',
})
export class Pedidos implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  tarefasPendentes: CardData[] = [];
  tarefasEmAndamento: CardData[] = [];
  tarefasConcluidas: CardData[] = [];
  tarefasTeste: CardData[] = [];
  tarefas: CardData[] = [];
  termoPesquisa = '';
  mostrarPesquisa = false;

  faPlus = faPlus;

  private itemSelecionadoParaUpload: ChecklistItem | null = null;
  private searchSub?: Subscription;

  constructor(
    private tarefaApi: TarefaApi,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    private kanbanSearch: KanbanSearchService,
  ) {}

  ngOnInit(): void {
    this.searchSub = this.kanbanSearch.openSearch$.subscribe(() => {
      this.abrirPesquisa();
    });
    this.carregarTarefas();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  carregarTarefas(): void {
    this.tarefaApi.buscarTodos().subscribe({
      next: (tarefasDto) => {
        console.log(tarefasDto)
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

  pesquisaAtiva(): boolean {
    return this.termoPesquisa.trim().length > 0;
  }

  abrirPesquisa(): void {
    this.mostrarPesquisa = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
    });
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
    this.mostrarPesquisa = false;
  }

  filtrarTarefas(tarefas: CardData[]): CardData[] {
    const termo = this.normalizarTexto(this.termoPesquisa);

    if (!termo) {
      return tarefas;
    }

    return tarefas.filter((tarefa) => {
      const titulo = this.normalizarTexto(tarefa.titulo);
      const responsavelNome = this.normalizarTexto(tarefa.responsavel?.nome);
      const responsavelEmail = this.normalizarTexto(tarefa.responsavel?.email);

      return (
        titulo.includes(termo) ||
        responsavelNome.includes(termo) ||
        responsavelEmail.includes(termo)
      );
    });
  }

  totalFiltrado(): number {
    return (
      this.filtrarTarefas(this.tarefasPendentes).length +
      this.filtrarTarefas(this.tarefasEmAndamento).length +
      this.filtrarTarefas(this.tarefasConcluidas).length +
      this.filtrarTarefas(this.tarefasTeste).length
    );
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
      () => console.log('Modal fechado sem salvar'),
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
    if (this.pesquisaAtiva()) {
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
          this.cdr.detectChanges();
        },
      });
  }

  abrirDetalheTarefa(tarefa: CardData): void {
    const ref = this.offcanvasService.open(TarefaDrawersComponent, {
      position: 'end',
      backdrop: true,
      scroll: true,
      panelClass: 'issue-offcanvas',
    });

    ref.componentInstance.tarefa = { ...tarefa };
    ref.componentInstance.tarefaAtualizada.subscribe(
      (tarefaAtualizada: CardData) => {
        this.onTarefaAtualizada(tarefaAtualizada);
      },
    );
    ref.componentInstance.tarefaExcluida.subscribe((tarefaId: string) => {
      this.onTarefaExcluida(tarefaId);
    });
  }

  private normalizarTexto(valor?: string | null): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
