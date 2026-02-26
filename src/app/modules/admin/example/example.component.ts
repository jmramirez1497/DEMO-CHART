import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexStroke,
  ApexLegend,
  ApexGrid,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexPlotOptions,
} from 'ng-apexcharts';

import { ExampleService } from './example.service';

const MESES     = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MESES_KEY = ['ene','feb','mar','abr','may','jun','jul','ago','sept','oct','nov','dic'];
const ALL_YEARS = ['2020','2021','2022','2023','2024','2025'];
const PRECIO_KWH = 900; // pesos colombianos por KWH

export type TabId = 'consumo-mensual' | 'relacion-mensual' | 'mayor-consumo' | 'consumo-diario' | 'resumen-tabla';

interface Tab { id: TabId; label: string; }

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule, FormsModule, MatTableModule],
  templateUrl: './example.component.html',
})
export class ExampleComponent implements OnInit {

  private readonly _service = inject(ExampleService);


  // ── Chart 1: Consumo mensual KWH ─────────────────────────────────────────
  seriesConsumoMensual = computed<ApexAxisChartSeries>(() => {
    const data = this._service.data();
    if (!data.length) return [];

    return ALL_YEARS.map(year => {
      const anio = data.find(a => a.fecha === year);
      const values = MESES_KEY.map(key => {
        const mes = anio?.meses.find(m => m.fecha === key);
        return +(mes?.energia_kwh ?? 0).toFixed(2);
      });
      return { name: year, data: values };
    });
  });

  chartConsumoMensual: ApexChart = {
    type: 'line', height: 400,
    toolbar: { show: true }, zoom: { enabled: false }, fontFamily: 'inherit',
  };

  titleConsumoMensual: ApexTitleSubtitle = {
    text: 'Consumo mensual de energía [KWH]',
    align: 'left',
    style: { fontSize: '14px', fontWeight: '600' },
  };

  yAxisKwh: ApexYAxis = {
    labels: {
      formatter: (val: number) => `${val.toLocaleString('es-CO')} KWH`,
      style: { fontSize: '11px' },
    },
    title: { text: 'Energía (KWH)', style: { fontSize: '12px' } },
  };

  tooltipKwh: ApexTooltip = {
    shared: true, intersect: false,
    y: {
      formatter: (val: number) => {
        const pesos = (val * PRECIO_KWH).toLocaleString('es-CO', { maximumFractionDigits: 0 });
        return `${val.toLocaleString('es-CO')} KWH · $${pesos}`;
      },
    },
  };

  // ── Chart 2: Relación mensual KWH/TON ────────────────────────────────────
  // Se calcula energia_kwh / (produccion_kg / 1000) para obtener el valor
  // correcto — el campo energia_prod_kwh_ton del JSON tiene errores en meses
  seriesRelacionMensual = computed<ApexAxisChartSeries>(() => {
    const data = this._service.data();
    if (!data.length) return [];

    return ALL_YEARS.map(year => {
      const anio = data.find(a => a.fecha === year);
      const values = MESES_KEY.map(key => {
        const mes = anio?.meses.find(m => m.fecha === key);
        return +(mes?.energia_prod_kwh_ton ?? 0).toFixed(4);
      });
      return { name: year, data: values };
    });
  });

  chartRelacionMensual: ApexChart = {
    type: 'line', height: 400,
    toolbar: { show: true }, zoom: { enabled: false }, fontFamily: 'inherit',
  };

  titleRelacionMensual: ApexTitleSubtitle = {
    text: 'Relación mensual energía/producción [KWH/TON]',
    align: 'left',
    style: { fontSize: '14px', fontWeight: '600' },
  };

  yAxisRelacion: ApexYAxis = {
    labels: {
      formatter: (val: number) => `${val.toFixed(2)} KWH/t`,
      style: { fontSize: '11px' },
    },
    title: { text: 'KWH / TON', style: { fontSize: '12px' } },
  };

  tooltipRelacion: ApexTooltip = {
    shared: true, intersect: false,
    y: {
      formatter: (val: number) => {
        const pesos = (val * PRECIO_KWH).toLocaleString('es-CO', { maximumFractionDigits: 0 });
        return `${val.toLocaleString('es-CO')} KWH/t · $${pesos}`;
      },
    },
  };

  // ── Chart 3: Mayor consumo — Top 5 días históricos ───────────────────────
  // Top 5 extraídos del JSON: todos los días, todos los años, orden desc
  seriesMayorConsumo: ApexAxisChartSeries = [
    {
      name: 'Consumo KWH',
      data: [2424.42, 2310.08, 2301.62, 2300.72, 2283.34],
    },
  ];

  chartMayorConsumo: ApexChart = {
    type: 'bar',
    height: 400,
    toolbar: { show: false },
    fontFamily: 'inherit',
  };

  dataLabelsMayorConsumo: ApexDataLabels = {
    enabled: false,
  };

  xAxisMayorConsumo: ApexXAxis = {
    categories: [
      '28 Abr 2023',
      '16 Ago 2025',
      '03 Abr 2023',
      '20 Nov 2022',
      '02 Abr 2023',
    ],
    labels: { style: { fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  yAxisMayorConsumo: ApexYAxis = {
    min: 2200,
    labels: {
      formatter: (val: number) => `${val.toLocaleString('es-CO')} KWH`,
      style: { fontSize: '11px' },
    },
  };

  tooltipMayorConsumo: ApexTooltip = {
    y: {
      formatter: (val: number) => {
        const pesos = (val * PRECIO_KWH).toLocaleString('es-CO', { maximumFractionDigits: 0 });
        return `${val.toLocaleString('es-CO')} KWH · $${pesos}`;
      },
    },
  };

  plotOptionsMayorConsumo = {
    bar: { borderRadius: 4, columnWidth: '50%', horizontal:false },
  };

  // ── Chart 4: Consumo diario KWH — dinámico por año/mes ──────────────────
  readonly anios       = ALL_YEARS;
  readonly mesesOpts  = [
    { key: 'ene',  label: 'Enero'      }, { key: 'feb',  label: 'Febrero'    },
    { key: 'mar',  label: 'Marzo'      }, { key: 'abr',  label: 'Abril'      },
    { key: 'may',  label: 'Mayo'       }, { key: 'jun',  label: 'Junio'      },
    { key: 'jul',  label: 'Julio'      }, { key: 'ago',  label: 'Agosto'     },
    { key: 'sept', label: 'Septiembre' }, { key: 'oct',  label: 'Octubre'    },
    { key: 'nov',  label: 'Noviembre'  }, { key: 'dic',  label: 'Diciembre'  },
  ];

  selectedAnio = signal<string>('2025');
  selectedMes  = signal<string>('ene');

  seriesConsumoDiario = computed<ApexAxisChartSeries>(() => {
    const data = this._service.data();
    if (!data.length) return [];

    const anio = data.find(a => a.fecha === this.selectedAnio());
    const mes  = anio?.meses.find(m => m.fecha === this.selectedMes());
    if (!mes?.dias?.length) return [];

    return [{
      name: 'Consumo KWH',
      data: mes.dias.map(d => +(d.energia_kwh ?? 0).toFixed(2)),
    }];
  });

  xAxisConsumoDiario = computed<ApexXAxis>(() => {
    const data = this._service.data();
    const anio = data.find(a => a.fecha === this.selectedAnio());
    const mes  = anio?.meses.find(m => m.fecha === this.selectedMes());
    const dias = mes?.dias ?? [];

    return {
      categories: dias.map(d => {
        const num = new Date(d.fecha).getDate();
        return num.toString();
      }),
      title: { text: 'Día del mes', style: { fontSize: '12px' } },
      labels: { style: { fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    };
  });

  chartConsumoDiario: ApexChart = {
    type: 'line', height: 400,
    toolbar: { show: true }, zoom: { enabled: true }, fontFamily: 'inherit',
  };

  titleConsumoDiario = computed<ApexTitleSubtitle>(() => ({
    text: `Consumo diario de energía — ${
      this.mesesOpts.find(m => m.key === this.selectedMes())?.label
    } ${this.selectedAnio()} [KWH]`,
    align: 'left' as const,
    style: { fontSize: '14px', fontWeight: '600' },
  }));

  yAxisConsumoDiario: ApexYAxis = {
    labels: {
      formatter: (val: number) => `${val.toLocaleString('es-CO')} KWH`,
      style: { fontSize: '11px' },
    },
    title: { text: 'Energía (KWH)', style: { fontSize: '12px' } },
  };

  tooltipConsumoDiario: ApexTooltip = {
    shared: false, intersect: true,
    y: {
      formatter: (val: number) => {
        const pesos = (val * PRECIO_KWH).toLocaleString('es-CO', { maximumFractionDigits: 0 });
        return `${val.toLocaleString('es-CO')} KWH · $${pesos}`;
      },
    },
  };

  markersDiario = { size: 4, hover: { size: 6 } };

  // ── Chart 5: % Mensual por año — Donut (mismo tab consumo diario) ─────────
  seriesPctMensual = computed<ApexNonAxisChartSeries>(() => {
    const data = this._service.data();
    if (!data.length) return [];

    const anio    = data.find(a => a.fecha === this.selectedAnio());
    const totalKwh = anio?.energia_kwh ?? 0;
    if (!totalKwh) return [];

    return anio!.meses.map(m =>
      +( (m.energia_kwh * 100) / totalKwh ).toFixed(2)
    );
  });

  // > 9% rojo | 5–9% amarillo | < 5% verde
  colorsPctMensual = computed<string[]>(() => {
    const series = this.seriesPctMensual() as number[];
    return series.map(pct => {
      if (pct > 9)  return '#ef4444'; // rojo
      if (pct >= 5) return '#f59e0b'; // amarillo
      return '#22c55e';               // verde
    });
  });

  chartPctMensual: ApexChart = {
    type: 'donut', height: 380, fontFamily: 'inherit',
  };

  titlePctMensual = computed<ApexTitleSubtitle>(() => ({
    text: `% Consumo mensual — ${this.selectedAnio()}`,
    align: 'left' as const,
    style: { fontSize: '14px', fontWeight: '600' },
  }));

  labelsPctMensual = computed<string[]>(() => {
    const data   = this._service.data();
    const anio   = data.find(a => a.fecha === this.selectedAnio());
    const total  = anio?.energia_kwh ?? 0;
    return (anio?.meses ?? []).map(m => {
      const label = this.mesesOpts.find(o => o.key === m.fecha)?.label ?? m.fecha;
      const kwh   = m.energia_kwh.toLocaleString('es-CO', { maximumFractionDigits: 0 });
      return `${label} (${kwh} KWH)`;
    });
  });

  dataLabelsPct: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`,
    style: { fontSize: '11px' },
  };

  plotOptionsPct: ApexPlotOptions = {
    pie: {
      donut: {
        size: '60%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '11px',
            formatter: () => {
              const data  = this._service.data();
              const anio  = data.find(a => a.fecha === this.selectedAnio());
              const total = anio?.energia_kwh ?? 0;
              return `${total.toLocaleString('es-CO', { maximumFractionDigits: 0 })} KWH`;
            },
          },
          total: {
            show: true,
            label:"Total año",
            color:"#000",
            fontSize: '11px',
            formatter: () => {
              const data  = this._service.data();
              const anio  = data.find(a => a.fecha === this.selectedAnio());
              const total = anio?.energia_kwh ?? 0;
              const pesos = (total * PRECIO_KWH).toLocaleString('es-CO', { maximumFractionDigits: 0 });
              return `$${pesos}`;
            },
          },
        },
      },
    },
  };

  legendPct: ApexLegend = {
    position: 'right',
    horizontalAlign: 'center',
    fontSize: '11px',
  };

  tooltipPct: ApexTooltip = {
    y: {
      formatter: (val: number) => `${val.toFixed(2)}%`,
    },
  };

  // ── Configs compartidas ───────────────────────────────────────────────────
  xAxisMeses: ApexXAxis = {
    categories: MESES,
    labels: { style: { fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  stroke: ApexStroke    = { curve: 'smooth', width: 2 };
  legend: ApexLegend    = { position: 'top', horizontalAlign: 'right' };
  grid: ApexGrid        = {
    borderColor: '#e0e0e0', strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  };

  // ── Tabla resumen anual ───────────────────────────────────────────────────
  readonly columnasTabla = ['anio', 'energia_kwh', 'energia_kwh_ton'];

  filasTabla = computed(() => {
    const data = this._service.data();
    if (!data.length) return [];

    const filas = data.map(a => ({
      anio:            a.fecha,
      energia_kwh:     a.energia_kwh,
      energia_kwh_ton: a.energia_prod_kwh_ton,
      esFila:          true,
    }));

    const totalKwh    = filas.reduce((acc, f) => acc + f.energia_kwh, 0);
    const totalKwhTon = filas.reduce((acc, f) => acc + f.energia_kwh_ton, 0);

    return [
      ...filas,
      { anio: 'Total', energia_kwh: totalKwh, energia_kwh_ton: totalKwhTon, esFila: false },
    ];
  });

  // ── Helpers de formato ────────────────────────────────────────────────────
  fmtKwh(val: number): string {
    return val.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  fmtKwhTon(val: number): string {
    return val.toLocaleString('es-CO', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }

  ngOnInit(): void {
    if (!this._service.data().length) {
      this._service.getResumen().subscribe();
    }
  }
}