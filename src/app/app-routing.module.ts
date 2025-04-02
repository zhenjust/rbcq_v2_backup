import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizeGuard } from '@core/guards/authorize.guard';
import { BaseComponent } from '@shared/modules/layout/base/base.component';

const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    canActivate: [AuthorizeGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false //disable hashing
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
