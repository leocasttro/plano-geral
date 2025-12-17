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
import { TarefaService, Tarefa } from '../../shared/services/tarefa.service';
import { NavBar } from '../../shared/nav-bar/nav-bar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalCadastroTarefa } from '../../shared/modals/modal-cadastro-tarefa';
import { splitDateTime } from '../../util/DateUtil';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

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
    private tarefaService: TarefaService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.tarefaService.listar().subscribe({
      next: (tarefas: Tarefa[]) => {
        const cards = tarefas.map((t) => this.mapearParaCardData(t));

        console.log(cards);

        this.tarefasPendentes = cards.filter(
          (c) => (c.status ?? '').toLowerCase() === 'pendente'
        );

        this.tarefasEmAndamento = cards.filter(
          (c) => (c.status ?? '').toLowerCase() === 'em_andamento'
        );

        this.tarefasConcluidas = cards.filter(
          (c) => (c.status ?? '').toLowerCase() === 'concluida'
        );

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar tarefas:', err),
    });
  }

  onNovaTarefa(): void {
    const modalRef = this.modalService.open(ModalCadastroTarefa, {
      centered: true,
      size: 'xl',
    });

    modalRef.result.then(
      (novaTarefa) => {
        if (novaTarefa) {
          this.tarefaService.criarTarefa(novaTarefa).subscribe({
            next: () => this.carregarTarefas(),
            error: (err) => console.error('Erro ao criar tarefa', err),
          });
        }
      },
      () => console.log('Modal fechado sem salvar')
    );
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
        event.currentIndex
      );
      return;
    }

    const tarefaMovida = event.previousContainer.data[event.previousIndex];

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    tarefaMovida.status = novoStatus;

    if (tarefaMovida.id) {
      this.tarefaService
        .atualizar(tarefaMovida.id, { status: novoStatus }) // 👈 só isso
        .subscribe({
          error: () => this.carregarTarefas(),
        });
    }
  }

  private mapearParaCardData(t: Tarefa): CardData {
    const dt = splitDateTime(t.dataCriacao);
    const dataCriacaoStr = dt
      ? `${dt.date} ${dt.time}`
      : new Date().toLocaleString();
    return {
      id: t.id,
      titulo: t.titulo,
      descricao: t.descricao ?? '',
      badgeTexto: t.badgeTexto ?? 'Nova',
      badgeClasseCor: t.badgeClasseCor ?? 'bg-secondary',
      urlImagem: t.urlImagem ?? 'https://placehold.co/24x24/999/FFF?text=?',
      dataCriacao: dataCriacaoStr,
      status: t.status ?? 'pendente',

      checklist: (t.checklist ?? []).map((item: any) => ({
        nome: item.nome,
        status: item.concluido ? 'Concluído' : 'Pendente',
      })),
    };
  }
}
