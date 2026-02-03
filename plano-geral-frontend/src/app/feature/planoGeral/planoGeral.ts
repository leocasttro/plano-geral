import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { TarefaDTO } from '../../domain/tarefa/tarefa.model';
import { NavBar } from '../../shared/nav-bar/nav-bar';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ModalCadastroTarefa } from '../../shared/modals/modal-cadastro-tarefa';
import { splitDateTime } from '../../util/DateUtil';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { TarefaDrawersComponent } from '../../shared/drawers/tarefa-drawers-component';
import { tarefaDtoToCardData } from './planoGeral.mapper';

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
  ],
  templateUrl: './planoGeral.html',
  styleUrl: './planoGeral.scss',
})
export class Pedidos implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  tarefasPendentes: CardData[] = [];
  tarefasEmAndamento: CardData[] = [];
  tarefasConcluidas: CardData[] = [];
  tarefasTeste: CardData[] = [];
  tarefas: CardData[] = [];

  faPlus = faPlus;

  private itemSelecionadoParaUpload: ChecklistItem | null = null;

  constructor(
    private tarefaApi: TarefaApi,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
  ) {}

  ngOnInit(): void {
    this.carregarTarefas();
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

  onNovaTarefa(): void {
    const modalRef = this.modalService.open(ModalCadastroTarefa, {
      centered: true,
      size: 'md',
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

  handleChecklistItemClick(item: ChecklistItem): void {
    this.itemSelecionadoParaUpload = item;
    this.fileInput.nativeElement.click();
  }

  drop(event: CdkDragDrop<CardData[]>, novoStatus: string): void {
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
      .atualizarStatus(tarefaMovida.id, statusNovo, 'usuario-logado')
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

  // private mapearParaCardData(t: Tarefa): CardData {
  //   const dt = splitDateTime(t.dataCriacao);
  //   const dataCriacaoStr = dt
  //     ? `${dt.date} ${dt.time}`
  //     : new Date().toLocaleString();
  //   return {
  //     id: t.id,
  //     titulo: t.titulo,
  //     descricao: t.descricao ?? '',
  //     badgeTexto: t.badgeTexto ?? 'Nova',
  //     badgeClasseCor: t.badgeClasseCor ?? 'bg-secondary',
  //     urlImagem: t.urlImagem ?? 'https://placehold.co/24x24/999/FFF?text=?',
  //     dataCriacao: dataCriacaoStr,
  //     status: t.status ?? 'pendente',

  //     checklist: (t.checklist ?? []).map((item: any) => ({
  //       nome: item.nome,
  //       status: item.concluido ? 'Concluído' : 'Pendente',
  //     })),
  //   };
  // }

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
  }
}
