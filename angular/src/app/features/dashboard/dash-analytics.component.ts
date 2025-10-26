/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */

import { Component, viewChild, TemplateRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ApexOptions,
  ChartComponent,
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexLegend,
  ApexDataLabels,
  ApexPlotOptions,
  ApexTooltip,
  ApexStroke
} from 'ng-apexcharts';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatError, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';

import Swal from 'sweetalert2';
import { Subject, switchMap, takeUntil, timer, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { General } from 'src/app/core/services/general.service';
import { DashboardCard, Client, TotalEnvelope, OccupancyEnvelope } from 'src/app/shared/Models/Entitys';
import { SharedModule } from 'src/app/shared/shared.module';
import { VehicleType } from '../parameters/pages/vehicleType/vehicle-type';

/** Tipado auxiliar para gráficos tipo donut o pie */
type NonAxisChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  colors?: string[];
  stroke?: ApexStroke;
};
/** Tipado auxiliar para opciones de zona */
type ZoneOption = { value: number; label: string };
/**
 * Componente principal del dashboard analítico.
 * Muestra información visual sobre ocupación de parqueaderos,
 * distribución por tipo de vehículo y estado de zonas.
 */
@Component({
  selector: 'app-dash-analytics',
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NgApexchartsModule,
    MatDialogModule,
    MatFormFieldModule, MatLabel, MatError,
    MatButtonModule, MatInputModule, MatOptionModule
  ],
  templateUrl: './dash-analytics.component.html',
  styleUrls: ['./dash-analytics.component.scss']
})
export class DashAnalyticsComponent implements OnInit {

   /**
   * 🎨 Paleta de colores suaves para mantener coherencia visual.
   * Usada en los gráficos y tarjetas.
   */
  private softPalette = {
    primary: '#5aa8c8',      // azul suave, menos vivo
    primaryDark: '#3f8fb8',  // azul slightly stronger for gradients
    green: '#6fc9a8',        // verde suave
    yellow: '#d8b46a',       // amarillo cálido y desaturado
    purple: '#9b86d6',       // morado suave
    neutral: '#98a3ad'       // texto/leyendas muted
  };
   /** Colores alternativos para gráficos de distribución */
  private piePalette = [
    '#d8b46a', // amarillo suave
    '#5aa8c8', // azul suave
    '#6fc9a8', // verde suave
    '#a6b3bb', // gris azulado (categorías pequeñas)
    '#9b86d6', // morado suave
    '#ffb4aa'  // coral muy suave
  ];
   /** Datos de formulario modal */
  formData: any = {};
   /** Listas de selección */
  vehicleTypes: { value: number; label: string }[] = [];
  clients: { value: number; label: string }[] = [];

   /** Ocupación global */
  capacity = { occupied: 0, total: 0, free: 0, percentage: 0 };

    /** Total de vehículos por tipo */
  vehicleTypeTotal = 0;

   /** ID del parqueadero activo */
  parkingId: string | null = null;

    /** Información de zonas */
  zones: ZoneOption[] = [];
  selectedZoneId: number | null = null;
  zoneCapacity = { id: 0, name: '', occupied: 0, total: 0, free: 0, percentage: 0 };
    /** Control de ciclo de vida RxJS */
  private destroy$ = new Subject<void>();

  /** Servicio general para peticiones HTTP */
  private service = inject(General);


  // ==================== REFERENCIAS A PLANTILLAS Y GRÁFICOS ====================
  @ViewChild('vehicleFormModal') vehicleFormModal!: TemplateRef<any>;
  @ViewChild('secondModal') secondModal!: TemplateRef<any>;

  // charts demo
  chartDB: any;
  chart = viewChild<ChartComponent>('chart');
  customerChart = viewChild<ChartComponent>('customerChart');
   /** Configuraciones de los diferentes gráficos ApexCharts */
  chartOptions!: Partial<ApexOptions>;
  chartOptions_1!: Partial<ApexOptions>;
  chartOptions_2!: Partial<ApexOptions>;
  chartOptions_3!: Partial<ApexOptions>;


    // ==================== CONFIGURACIÓN DE DONUTS / PIES ====================
  occupancyDonutOptions: NonAxisChartOptions = {
    series: [0.0001, 0.0001],
    chart: {
      type: 'donut',
      height: 240,
      toolbar: { show: false },
      // states is accepted by Apex, but some versions may ignore; keeping minimal hover effects
      // to avoid bright highlight we rely on stroke & fill opacities instead.
    },
    colors: [ this.softPalette.primary, this.softPalette.green ],
    labels: ['Ocupados', 'Libres'],
    legend: {
      position: 'bottom',
      offsetY: 6,
      fontSize: '12px',
      labels: { colors: this.softPalette.neutral }
    },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: ['rgba(255,255,255,0.06)'] },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: false },
            value: { show: false },
            total: {
              show: true,
              label: 'Ocupación',
              formatter: (w: any) => {
                const s: number[] = w.globals.seriesTotals || [0, 0];
                const total = (s[0] ?? 0) + (s[1] ?? 0);
                const occ = s[0] ?? 0;
                return total ? `${Math.round((occ / total) * 100)}%` : '0%';
              }
            }
          }
        }
      }
    },
    tooltip: { theme: 'dark', y: { formatter: (val: number) => `${val} cupos` } }
  };


    /** Gráfico de distribución por tipo de vehículo */
  vehicleTypePieOptions: NonAxisChartOptions = {
    series: [1],
    chart: { type: 'pie', height: 240, toolbar: { show: false } },
    colors: this.piePalette,
    labels: ['Sin datos'],
    legend: {
      position: 'bottom',
      offsetY: 6,
      fontSize: '12px',
      labels: { colors: this.softPalette.neutral }
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['#ffffff'] },
      formatter: (_val: number, ctx: any) =>
        `${Math.round(ctx?.w?.globals?.seriesPercent?.[ctx.seriesIndex]?.[0] ?? 0)}%`
    },
    stroke: { width: 1, colors: ['rgba(255,255,255,0.06)'] },
    plotOptions: { pie: { expandOnClick: false } },
    tooltip: {
      theme: 'dark',
      custom: ({ series, seriesIndex, w }: any) => {
        const count = Number(series?.[seriesIndex] ?? 0);
        const pct = Math.round(w?.globals?.seriesPercent?.[seriesIndex]?.[0] ?? 0);
        const plural = count === 1 ? '' : 's';
        return `<div class="apex-tooltip"><b>${count} vehículo${plural}</b> (${pct}%)</div>`;
      }
    }
  };


    /** Donut de ocupación por zona */
  zoneDonutOptions: NonAxisChartOptions = {
    series: [0.0001, 0.0001],
    chart: { type: 'donut', height: 240, toolbar: { show: false } },
    colors: [ this.softPalette.primary, this.softPalette.green ],
    labels: ['Ocupados', 'Libres'],
    legend: {
      position: 'bottom',
      offsetY: 6,
      fontSize: '12px',
      labels: { colors: this.softPalette.neutral }
    },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: ['rgba(255,255,255,0.06)'] },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: false },
            value: { show: false },
            total: {
              show: true,
              label: 'Ocupación zona',
              formatter: (w: any) => {
                const s: number[] = w.globals.seriesTotals || [0, 0];
                const total = (s[0] ?? 0) + (s[1] ?? 0);
                const occ = s[0] ?? 0;
                return total ? `${Math.round((occ / total) * 100)}%` : '0%';
              }
            }
          }
        }
      }
    },
    tooltip: { theme: 'dark', y: { formatter: (val: number) => `${val} cupos` } }
  };


  // palette suave y coherente para todo el dashboard

  constructor(private dialog: MatDialog) {

    /**
     * Inicialización de gráficos demo.
     * En producción, se reemplazan por datos reales del backend.
     */
    this.chartOptions = {
      chart: { height: 205, type: 'line', toolbar: { show: false } },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'smooth' },
      series: [
        { name: 'Arts', data: [20, 50, 30, 60, 30, 50] },
        { name: 'Commerce', data: [60, 30, 65, 45, 67, 35] }
      ],
      legend: { position: 'top', labels: { colors: this.softPalette.neutral } },
      xaxis: {
        type: 'datetime',
        categories: ['1/11/2000','2/11/2000','3/11/2000','4/11/2000','5/11/2000','6/11/2000'],
        axisBorder: { show: false },
        labels: { style: { colors: this.softPalette.neutral } }
      },
      yaxis: {
        show: true,
        min: 10,
        max: 70,
        labels: { style: { colors: this.softPalette.neutral } }
      },
      colors: [ this.softPalette.primary, this.softPalette.green ],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          gradientToColors: [ this.softPalette.primaryDark, this.softPalette.green ],
          shadeIntensity: 0.28,
          type: 'horizontal',
          opacityFrom: 0.55, // reduce opacity to make it less vivid
          opacityTo: 0.28,
          stops: [0, 100]
        }
      },
      grid: { borderColor: 'rgba(255,255,255,0.03)' },
      markers: {
        size: 4,
        hover: { size: 5, sizeOffset: 0 }
      }
    };

    this.chartOptions_1 = {
      chart: { height: 150, type: 'donut' },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '75%' } } },
      labels: ['New','Return'],
      series: [39,10],
      legend: { show: false },
      tooltip: { theme: 'dark' },
      grid: { padding: { top: 20, right: 0, bottom: 0, left: 0 } },
      colors: [ this.softPalette.primary, this.softPalette.green ],
      stroke: { width: 1, colors: ['rgba(255,255,255,0.06)'] },
      fill: { opacity: [0.95, 0.9] }
    };

    this.chartOptions_2 = {
      chart: { height: 150, type: 'donut' },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '75%' } } },
      labels: ['New','Return'],
      series: [20,15],
      legend: { show: false },
      tooltip: { theme: 'dark' },
      grid: { padding: { top: 20, right: 0, bottom: 0, left: 0 } },
      colors: [ '#f0f3f6', this.softPalette.green ],
      fill: { opacity: [0.9, 0.9] },
      stroke: { width: 1, colors: ['rgba(255,255,255,0.06)'] }
    };

    this.chartOptions_3 = {
      chart: { type: 'area', height: 145, sparkline: { enabled: true } },
      dataLabels: { enabled: false },
      colors: [ this.softPalette.yellow ],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: [ '#f6b87a' ],
          shadeIntensity: 0.6,
          type: 'horizontal',
          opacityFrom: 0.65,
          opacityTo: 0.25,
          stops: [0,100]
        }
      },
      stroke: { curve: 'smooth', width: 2 },
      series: [{ data: [45,35,60,50,85,70] }],
      yaxis: { min: 5, max: 90, labels: { style: { colors: this.softPalette.neutral } } },
      tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } }
    };
  }

   /** Tarjetas principales del dashboard */
  cards: DashboardCard[] = [
    { id: 'currentVehicles', background: 'bg-c-blue', title: 'Vehículos estacionados hoy', icon: 'fas fa-car', number: '—' },
    { id: 'dailyRevenue', background: 'bg-c-green', title: 'Ingresos del día', icon: 'fas fa-dollar-sign', number: '—' },
    { id: 'availableSlots', background: 'bg-c-yellow', title: 'Slots disponibles', icon: 'fas fa-draw-polygon', number: '—' },
    // { id: 'activeMemberships', background: 'bg-c-red', title: 'Membresías activas', icon: 'fas fa-credit-card', number: '—' }
  ];
    // ===========================================================
  // ==================== CICLO DE VIDA ========================
  // ===========================================================
  ngOnInit(): void {
     // Obtener parkingId actual desde el servicio
    this.parkingId = this.service.getParkingId();
    // tipos de vehículo
    this.service.get<{ data: VehicleType[] }>('TypeVehicle/select').subscribe(res => {
      if (res?.data) this.vehicleTypes = res.data.map(item => ({ value: item.id, label: item.name }));
    });

    // clientes
    this.service.get<{ data: Client[] }>('Client/join').subscribe(res => {
      if (res?.data) this.clients = res.data.map(item => ({ value: item.id, label: item.name }));
    });

    // zonas
    this.loadZones();

    // polling (global + tipos + zona actual)
    this.startDashboardPolling();
  }

  // =================== POLLING ===================
  private startDashboardPolling() {
    timer(0, 10000)
      .pipe(
        switchMap(() =>
          forkJoin({
            total: this.service.get<TotalEnvelope | any>(`Dashboard/current/parked-vehicles/total?parkingId=${this.parkingId}`).pipe(catchError(() => of(null))),
            occupancy: this.service.get<OccupancyEnvelope | any>(`Dashboard/occupancy/global?parkingId=${this.parkingId}`).pipe(catchError(() => of(null))),
            distribution: this.service.get<any>(`Dashboard/distribution/types/global?parkingId=${this.parkingId}&includeZeros=true`).pipe(catchError(() => of(null))),
            zoneOcc: this.selectedZoneId ? this.getZoneOcc$(this.selectedZoneId).pipe(catchError(() => of(null))) : of(null)
          })
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(({ total, occupancy, distribution, zoneOcc }) => {
        // total
        if (total) {
          const t = Number((total as any)?.data?.total ?? (total as any)?.total ?? 0);
          this.setCardNumberById('currentVehicles', t);
        }

        // ocupación global
        if (occupancy) {
          const d: any = (occupancy as any).data ?? occupancy;
          const occupied = Number(d?.occupied ?? 0);
          const totalSlots = Number(d?.total ?? (occupied + Number(d?.free ?? 0)));
          const free = Math.max(Number(d?.free ?? (totalSlots - occupied)), 0);
          const percentage = totalSlots ? (occupied / totalSlots) * 100 : 0;

          this.capacity = { occupied, total: totalSlots, free, percentage };
          this.occupancyDonutOptions = { ...this.occupancyDonutOptions, series: [Math.max(occupied, 0.0001), Math.max(free, 0.0001)] };
        }

        // distribución por tipo
        if (distribution) {
          const d: any = distribution.data ?? distribution;
          const labels: string[] =
            Array.isArray(d?.labels) && d.labels.length ? d.labels :
            Array.isArray(d?.slices) ? d.slices.map((s: any) => s.name) : [];
          const series: number[] =
            Array.isArray(d?.series) && d.series.length ? d.series.map((n: any) => Number(n ?? 0)) :
            Array.isArray(d?.slices) ? d.slices.map((s: any) => Number(s?.count ?? 0)) : [];

          const sum = series.reduce((a, b) => a + b, 0);
          this.vehicleTypeTotal = Number(d?.total ?? sum);

          this.vehicleTypePieOptions = (!labels.length || sum === 0)
            ? { ...this.vehicleTypePieOptions, labels: ['Sin datos'], series: [1] }
            : { ...this.vehicleTypePieOptions, labels, series };
        }

        // zona
        if (zoneOcc) this.applyZoneOccToDonut(zoneOcc);
      });
  }

  setCardNumberById(id: string, value: number | string) {
    const card = this.cards.find(c => c.id === id);
    if (!card) return;
    card.number = value;
  }

  // ===================== ZONAS =====================

  /** Payload robusto para: {data:[...]}, {data:{data:[...]}}, o el array directo */
  private loadZones() {
    this.service.get<any>('Zones/join').subscribe({
      next: (res) => {
        const arr: any[] =
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.data?.data) ? res.data.data :
          Array.isArray(res) ? res : [];

        const notDeleted = (z: any) =>
          !(z?.isDeleted === true || String(z?.isDeleted).toLowerCase() === 'true');

        this.zones = arr
          .filter(notDeleted)
          .map((z: any): ZoneOption => ({
            value: Number(z?.id ?? z?.zoneId ?? z?.value),
            label: String(z?.name ?? z?.zoneName ?? `Zona ${z?.id ?? z?.zoneId ?? ''}`.trim())
          }))
          .filter((opt: ZoneOption) => Number.isFinite(opt.value));

        // Seleccionar primera zona válida y pintar
        if (this.zones.length) {
          if (this.selectedZoneId == null) this.selectedZoneId = this.zones[0].value;
          this.loadZoneOccupancy(this.selectedZoneId);
        }
      },
      error: (err) => {
        console.error("Error al cargar zonas:", err);
        this.zones = [];
        this.selectedZoneId = null;
      }

    });
  }

  onZoneBtnClick(id: number) {
    if (id == null) return;
    this.selectedZoneId = id;
    this.loadZoneOccupancy(id);
  }

  /** Soporta varias rutas posibles del back */
  private getZoneOcc$(zoneId: number) {
    return this.service.get<any>(`RegisteredVehicles/occupancy/sectors/by-zone/${zoneId}`).pipe(
      catchError(() => this.service.get<any>(`RegisteredVehicles/occupancy/sectors/by-zone?zoneId=${zoneId}`)),
      catchError(() => this.service.get<any>(`Slots/occupancy/zone?zoneId=${zoneId}`))
    );
  }

  private loadZoneOccupancy(zoneId: number) {
    this.getZoneOcc$(zoneId).pipe(
      catchError(() => of({
        data: [{
          id: zoneId,
          name: this.zones.find(z => z.value === zoneId)?.label || 'Zona',
          occupied: 0, total: 0, free: 0, percentage: 0
        }]
      }))
    ).subscribe(res => this.applyZoneOccToDonut(res));
  }

  private applyZoneOccToDonut(payload: any) {
    const rows = payload?.data ?? payload ?? [];
    const r = Array.isArray(rows) ? rows[0] : rows;

    const name = r?.name ?? (this.zones.find(z => z.value === this.selectedZoneId)?.label || 'Zona');
    const occupied = Number(r?.occupied ?? 0);
    const total    = Number(r?.total ?? (occupied + Number(r?.free ?? 0)));
    const free     = Math.max(Number(r?.free ?? (total - occupied)), 0);
    const percentage = total ? (occupied / total) * 100 : 0;

    this.zoneCapacity = { id: Number(r?.id ?? this.selectedZoneId ?? 0), name, occupied, total, free, percentage };
    this.zoneDonutOptions = { ...this.zoneDonutOptions, series: [Math.max(occupied, 0.0001), Math.max(free, 0.0001)] };
  }
  // =================================================

  // diálogos
  openFormDialog(templateRef: TemplateRef<any>) {
    this.formData = {};
    this.dialog.open(templateRef, { width: '600px' });
  }

  save(data: any) {
    delete data.id;
    this.service.post('Vehicle', data).subscribe(() => {
      Swal.fire({ icon: 'success', title: 'Vehículo creado exitosamente', showConfirmButton: false, timer: 2000, timerProgressBar: true })
        .then(() => { this.dialog.closeAll(); this.dialog.open(this.secondModal, { width: '400px' }); });
    });
  }

  // Helper para obtener la clase CSS de la card basada en el background
  getCardClass(background: string): string {
    const classMap: { [key: string]: string } = {
      'bg-c-blue': 'blue',
      'bg-c-green': 'green',
      'bg-c-yellow': 'yellow',
      'bg-c-red': 'red',
      'bg-c-orange': 'yellow' // Mapear orange a yellow para consistencia
    };
    return classMap[background] || 'blue';
  }

  // Helper para obtener la clase del icono basada en el background
  getIconClass(background: string): string {
    return this.getCardClass(background);
  }

  // Helper para obtener porcentaje de cambio (puedes conectar con datos reales)
  getChangePercentage(cardId: string): string | null {
    const changes: { [key: string]: string } = {
      'currentVehicles': '+12%',
      'dailyRevenue': '+8%',
      'availableSlots': '-5%'
    };
    return changes[cardId] || null;
  }

  /** Devuelve la clase completa que se pasará a app-card.
   *  type: 'stat' | 'chart' (puedes añadir más variantes si quieres)
   */
  getCardClassString(bgClass: string | undefined, type: 'stat' | 'chart' | string = 'chart'): string {
    const bg = (bgClass || '').trim();

    // Mapa desde tu clase bg-c-* a la clase de acento que definimos en CSS
    const accentMap: { [k: string]: string } = {
      'bg-c-blue': 'card-accent-blue',
      'bg-c-green': 'card-accent-green',
      'bg-c-yellow': 'card-accent-yellow',
      'bg-c-orange': 'card-accent-yellow', // orange → yellow accent (opcional)
      'bg-c-red': 'card-accent-purple'     // red → purple (ajusta si quieres otro)
    };

    const accent = accentMap[bg] || 'card-accent-blue';

    // Elige clases base según tipo (stat vs chart)
    if (type === 'stat') {
      // stat-card y variante vibrante
      return `${bg} stat-card stat-card--vibrant ${accent}`;
    } else if (type === 'chart') {
      // chart-card para graficos
      return `${bg} chart-card ${accent}`;
    } else {
      // fallback genérico
      return `${bg} order-card ${accent}`;
    }
  }

  // Helper para generar alertas de ejemplo (reemplaza con tu lógica real)
  getRecentAlerts() {
    return [
      {
        message: `<strong>Entrada de vehículo registrada:</strong>
                  ¡Vehículo ingresado! <span class="label">Placa:</span> ABC123 –
                  <span class="label">Hora:</span> 10:30 AM`
      },
      {
        message: `<strong>Zonas disponibles al límite:</strong>
                  ¡Advertencia! Solo quedan 2 plazas disponibles`
      },
      {
        message: `<strong>Vehículo detectado en la lista negra:</strong>
                  ¡Ojo! el vehículo con <span class="label">Placa:</span> ABC123 –
                  <span class="label">Esta en la lista negra</span>`
      }
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
