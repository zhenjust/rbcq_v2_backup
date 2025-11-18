import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MqUploaderComponent } from './mq-uploader/mq-uploader.component';


const routes: Routes = [
  {
    path: '',
    component: MqUploaderComponent
  },
  {
    path: 'mq-uploader',
    component: MqUploaderComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeteringRoutingModule { }
