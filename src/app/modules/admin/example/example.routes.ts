import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ExampleComponent } from 'app/modules/admin/example/example.component';
import { ExampleService } from './example.service';

export default [
    {
        path     : '',
        component: ExampleComponent,
        resolve: { resumen: () => inject(ExampleService).getResumen() }
    },
] as Routes;
