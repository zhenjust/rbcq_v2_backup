import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseComponent } from './base/base.component';
import { ViewRbcqComponent } from './view-rbcq/view-rbcq.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'submit',
    pathMatch: 'full'
  },
  {
    path: 'submit',
    component: BaseComponent,
  },
  {
    path: 'process',
    loadChildren: () => import('../rbcq-process/rbcq-process.module').then(m => m.RbcqProcessModule)
  },
  {
    path: 'view',
    component: ViewRbcqComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RbcqRoutingModule { }
