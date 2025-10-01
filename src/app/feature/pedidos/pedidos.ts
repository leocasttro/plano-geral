import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardData } from "../../shared/component/card-component/card-component";
// 1. Importar os módulos necessários do Angular CDK
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  // 2. Adicionar os módulos do CDK aos imports do componente
  imports: [CommonModule, CardComponent, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class Pedidos {

  // As listas de tarefas que você já tinha
  tarefasPendentes: CardData[] = [
    {
      titulo: "Preparar sala de cirurgia 3",
      descricao: "Verificar equipamentos e esterilização.",
      badgeTexto: "Urgente",
      badgeClasseCor: "bg-danger",
      urlImagem: "https://placehold.co/24x24/FF0000/FFFFFF?text=S",
      dataCriacao: "01/10/2025"
    },
    {
      titulo: "Confirmar jejum do paciente M. Silva",
      descricao: "Ligar para o paciente ou responsável.",
      badgeTexto: "Prioridade Média",
      badgeClasseCor: "bg-warning",
      urlImagem: "https://placehold.co/24x24/FFFF00/000000?text=P",
      dataCriacao: "30/09/2025"
    },
  ];

  tarefasEmAndamento: CardData[] = [
    {
      titulo: "Cirurgia de apendicite",
      descricao: "Paciente A. Costa - Sala 1.",
      badgeTexto: "Em Progresso",
      badgeClasseCor: "bg-primary",
      urlImagem: "https://placehold.co/24x24/0000FF/FFFFFF?text=A",
      dataCriacao: "01/10/2025"
    }
  ];

  tarefasConcluidas: CardData[] = [
    {
      titulo: "Relatório pós-cirúrgico",
      descricao: "Paciente C. Pereira.",
      badgeTexto: "Finalizado",
      badgeClasseCor: "bg-success",
      urlImagem: "https://placehold.co/24x24/00FF00/FFFFFF?text=R",
      dataCriacao: "28/09/2025"
    }
  ];

  // 3. Método que será chamado quando um card for solto
  drop(event: CdkDragDrop<CardData[]>) {
    if (event.previousContainer === event.container) {
      // Se o card foi solto na mesma coluna, apenas muda a ordem
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Se o card foi movido para uma coluna diferente, transfere o item de uma lista para outra
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}

