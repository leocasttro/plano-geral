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

@Component({
  selector: 'app-project-status-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './project-status-chart.html',
  styleUrl: './project-status-chart.scss',
})
export class ProjectStatusChartComponent implements OnChanges {
  @Input() ativos = 0;
  @Input() pausados = 0;
  @Input() concluidos = 0;
  @Input() cancelados = 0;

  series: ApexAxisChartSeries = [];
  colors = ['#0d6efd'];

  chart: ApexChart = {
    type: 'bar',
    height: 260,
    toolbar: { show: false },
    fontFamily: 'inherit',
  };

  plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 5,
      barHeight: '46%',
    },
  };

  dataLabels: ApexDataLabels = {
    enabled: true,
    style: {
      colors: ['#111827'],
      fontWeight: 700,
    },
    offsetX: 8,
  };

  xaxis: ApexXAxis = {
    categories: ['Ativos', 'Pausados', 'Concluídos', 'Cancelados'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#6b7280' } },
  };

  yaxis: ApexYAxis = {
    labels: { style: { colors: ['#6b7280'] } },
  };

  grid: ApexGrid = {
    borderColor: '#e5e7eb',
    strokeDashArray: 4,
  };

  tooltip: ApexTooltip = {
    y: {
      formatter: (value) => `${value} projetos`,
    },
  };

  ngOnChanges(): void {
    this.series = [
      {
        name: 'Projetos',
        data: [this.ativos, this.pausados, this.concluidos, this.cancelados],
      },
    ];
  }
}
