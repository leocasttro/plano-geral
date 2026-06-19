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
  @Input() dados: {
    data: string;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
  }[] = [];

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
    const dadosOrdenados = [...this.dados].sort((a, b) =>
      a.data.localeCompare(b.data),
    );

    this.xaxis = {
      ...this.xaxis,
      categories: dadosOrdenados.map((item) => this.formatarData(item.data)),
    };

    this.series = [
      {
        name: 'Pendentes',
        data: dadosOrdenados.map((item) => item.pendentes),
      },
      {
        name: 'Em andamento',
        data: dadosOrdenados.map((item) => item.emAndamento),
      },
      {
        name: 'Concluídas',
        data: dadosOrdenados.map((item) => item.concluidas),
      },
    ];
  }

  private formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');

    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}`;
  }
}
