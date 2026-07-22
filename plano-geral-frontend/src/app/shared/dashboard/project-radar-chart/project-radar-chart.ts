import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexMarkers,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { RelatorioMetricasProjetosDTO } from '../../../domain/relatorio/relatorio.model';

type MetricaProjeto = RelatorioMetricasProjetosDTO['projetos'][number];

@Component({
  selector: 'app-project-radar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './project-radar-chart.html',
  styleUrl: './project-radar-chart.scss',
})
export class ProjectRadarChartComponent implements OnChanges {
  @Input() projeto: MetricaProjeto | null = null;

  series: ApexAxisChartSeries = [];
  colors = ['#084298'];

  chart: ApexChart = {
    type: 'radar',
    height: 380,
    toolbar: { show: false },
    fontFamily: 'inherit',
  };

  xaxis: ApexXAxis = {
    categories: [
      'Avanço',
      'Conclusão',
      'Prazo',
      'Em andamento',
      'Concluídas',
    ],
    labels: {
      style: {
        colors: '#1f2937',
        fontSize: '13px',
        fontWeight: 700,
      },
    },
  };

  yaxis: ApexYAxis = {
    show: false,
    min: 0,
    max: 100,
    tickAmount: 4,
    labels: {
      show: false,
      formatter: () => '',
    },
  };

  stroke: ApexStroke = {
    width: 3,
  };

  fill: ApexFill = {
    opacity: 0.24,
  };

  markers: ApexMarkers = {
    size: 5,
    strokeWidth: 0,
  };

  plotOptions: ApexPlotOptions = {
    radar: {
      polygons: {
        strokeColors: '#94a3b8',
        connectorColors: '#94a3b8',
        fill: {
          colors: ['#f8fafc', '#eef2f7'],
        },
      },
    },
  };

  dataLabels: ApexDataLabels = {
    enabled: false,
  };

  tooltip: ApexTooltip = {
    y: {
      formatter: (value) => `${Number(value).toFixed(1)}%`,
    },
  };

  ngOnChanges(): void {
    if (!this.projeto) {
      this.series = [];
      return;
    }

    const totalTarefas = this.projeto.totalTarefas;
    const percentualEmAndamento = this.percentual(
      this.projeto.tarefasEmAndamento,
      totalTarefas,
    );
    const percentualConcluidas = this.percentual(
      this.projeto.tarefasConcluidas,
      totalTarefas,
    );

    this.series = [
      {
        name: this.projeto.nome,
        data: [
          this.projeto.indiceAvanco,
          this.projeto.percentualConclusao,
          this.projeto.percentualRespeitoPrazo,
          percentualEmAndamento,
          percentualConcluidas,
        ],
      },
    ];
  }

  private percentual(parte: number, total: number): number {
    if (!total) {
      return 0;
    }

    return Number(((parte / total) * 100).toFixed(2));
  }
}
