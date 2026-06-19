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
  selector: 'app-productivity-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './productivity-chart.html',
  styleUrl: './productivity-chart.scss',
})
export class ProductivityChartComponent implements OnChanges {
  @Input() criadas = 0;
  @Input() concluidas = 0;

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
      borderRadius: 6,
      columnWidth: '44%',
      distributed: true,
    },
  };

  dataLabels: ApexDataLabels = { enabled: false };

  xaxis: ApexXAxis = {
    categories: ['Criadas', 'Concluídas'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: ['#6b7280', '#6b7280'] } },
  };

  yaxis: ApexYAxis = {
    min: 0,
    tickAmount: 4,
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
    this.series = [
      {
        name: 'Tarefas',
        data: [this.criadas, this.concluidas],
      },
    ];
  }
}
