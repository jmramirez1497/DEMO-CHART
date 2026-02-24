import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { map, tap } from 'rxjs';

export interface ResumenDia {
  fecha: string;
  produccion_kg: number | null;
  num_baches: number | null;
  agua_lt: number | null;
  energia_kwh: number | null;
  energia_prod_kwh_ton: number | null;
  vapor_kg: number | null;
  vapor_prod_kg_ton: number | null;
  vapor_desp_kg: number | null;
}

export interface ResumenMes extends ResumenDia {
  dias: ResumenDia[];
}

export interface ResumenAnio extends ResumenDia {
  meses: ResumenMes[];
}

export interface ResumenResponse {
  data: ResumenAnio[];
}

@Injectable({
  providedIn: 'root'
})
export class ExampleService {

  private readonly _data = signal<ResumenAnio[]>([]);
  readonly data = this._data.asReadonly();

  constructor(private _httpClient: HttpClient) {}

  getResumen() {
    return this._httpClient.get<ResumenResponse>('api/dashboards/demo-chart').pipe(
      map(res => res.data),
      tap(data => this._data.set(data))
    );
  }
}
