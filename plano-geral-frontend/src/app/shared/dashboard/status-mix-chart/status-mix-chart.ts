import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexTooltip,
  NgApexchartsModule,
} from 'ng-apexcharts';

@Component({
  selector: 'app-status-mix-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './status-mix-chart.html',
  styleUrl: './status-mix-chart.scss',
})
export class StatusMixChartComponent implements OnChanges {
  @Input() pendentes = 0;
  @Input() andamento = 0;
  @Input() concluidas = 0;
  @Input() atrasadas = 0;

  series: ApexNonAxisChartSeries = [];
  labels = ['Pendentes', 'Em andamento', 'Concluídas', 'Atrasadas'];
  colors = ['#ffc107', '#20c997', '#198754', '#dc3545'];

  chart: ApexChart = {
    type: 'donut',
    height: 286,
    toolbar: { show: false },
    fontFamily: 'inherit',
  };

  plotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            color: '#6b7280',
          },
          value: {
            color: '#111827',
            fontWeight: 800,
          },
        },
      },
    },
  };

  legend: ApexLegend = {
    position: 'bottom',
    fontSize: '12px',
    labels: { colors: '#6b7280' },
    markers: { size: 5 },
  };

  dataLabels: ApexDataLabels = { enabled: false };

  tooltip: ApexTooltip = {
    y: {
      formatter: (value) => `${value} tarefas`,
    },
  };

  ngOnChanges(): void {
    this.series = [
      this.pendentes,
      this.andamento,
      this.concluidas,
      this.atrasadas,
    ];
  }
}
