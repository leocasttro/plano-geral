import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

export interface UserPerformanceChartItem {
  nome: string;
  totalTarefas: number;
  concluidas: number;
}

@Component({
  selector: 'app-user-performance-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './user-performance-chart.html',
  styleUrl: './user-performance-chart.scss',
})
export class UserPerformanceChartComponent implements OnChanges {
  @Input() usuarios: UserPerformanceChartItem[] = [];

  series: ApexAxisChartSeries = [];
  colors = ['#0d6efd', '#198754'];

  chart: ApexChart = {
    type: 'bar',
    height: 260,
    toolbar: { show: false },
    fontFamily: 'inherit',
  };

  plotOptions: ApexPlotOptions = {
    bar: {
      borderRadius: 5,
      columnWidth: '48%',
    },
  };

  dataLabels: ApexDataLabels = { enabled: false };

  xaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      trim: true,
      style: { colors: '#6b7280' },
    },
  };

  yaxis: ApexYAxis = {
    min: 0,
    labels: { style: { colors: ['#6b7280'] } },
  };

  grid: ApexGrid = {
    borderColor: '#e5e7eb',
    strokeDashArray: 4,
  };

  tooltip: ApexTooltip = {
    y: {
      formatter: (value) => `${value} tarefas`,
    },
  };

  ngOnChanges(): void {
    const principais = [...this.usuarios]
      .sort((a, b) => b.totalTarefas - a.totalTarefas)
      .slice(0, 5);

    this.xaxis = {
      ...this.xaxis,
      categories: principais.map((usuario) => usuario.nome),
    };

    this.series = [
      {
        name: 'Total',
        data: principais.map((usuario) => usuario.totalTarefas),
      },
      {
        name: 'Concluídas',
        data: principais.map((usuario) => usuario.concluidas),
      },
    ];
  }
}
