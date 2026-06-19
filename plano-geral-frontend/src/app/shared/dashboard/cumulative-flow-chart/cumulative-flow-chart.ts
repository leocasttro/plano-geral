import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

@Component({
  selector: 'app-cumulative-flow-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './cumulative-flow-chart.html',
  styleUrl: './cumulative-flow-chart.scss',
})
export class CumulativeFlowChartComponent implements OnChanges {
  @Input() pendentes = 0;
  @Input() andamento = 0;
  @Input() concluidas = 0;

  series: ApexAxisChartSeries = [];
  colors = ['#ffc107', '#0d6efd', '#198754'];

  chart: ApexChart = {
    type: 'line',
    height: 300,
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'inherit',
  };

  stroke: ApexStroke = {
    curve: 'smooth',
    width: 3,
  };

  markers: ApexMarkers = {
    size: 4,
    strokeWidth: 2,
    hover: {
      size: 6,
    },
  };

  dataLabels: ApexDataLabels = {
    enabled: false,
  };

  xaxis: ApexXAxis = {
    categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: {
        colors: '#6b7280',
      },
    },
  };

  yaxis: ApexYAxis = {
    min: 0,
    tickAmount: 4,
    labels: {
      style: {
        colors: ['#6b7280'],
      },
    },
  };

  grid: ApexGrid = {
    borderColor: '#e5e7eb',
    strokeDashArray: 4,
    padding: {
      left: 8,
      right: 8,
    },
  };

  tooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: {
      formatter: (value) => `${value} tarefas`,
    },
  };

  ngOnChanges(): void {
    this.series = [
      {
        name: 'Pendentes',
        data: this.distribuirSemana(this.pendentes, [0.72, 0.8, 0.76, 0.9, 1, 0.42, 0.3]),
      },
      {
        name: 'Em andamento',
        data: this.distribuirSemana(this.andamento, [0.58, 0.72, 0.7, 0.84, 0.62, 0.28, 0.18]),
      },
      {
        name: 'Concluídas',
        data: this.distribuirSemana(this.concluidas, [0.42, 0.58, 0.7, 0.66, 0.88, 0.36, 0.2]),
      },
    ];
  }

  private distribuirSemana(total: number, fatores: number[]): number[] {
    if (!total || total < 0) {
      return fatores.map(() => 0);
    }

    return fatores.map((fator) => Math.max(0, Math.round(total * fator)));
  }
}
