import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base/base.component';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { BellComponent } from './bell/bell.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    BaseComponent,
    HeaderComponent,
    NavbarComponent,
    BellComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    NzDropDownModule,
    NzListModule,
    NzIconModule,
    NzPopoverModule,
    NzSpaceModule,
    FontAwesomeModule
  ]
})
export class LayoutModule { }
