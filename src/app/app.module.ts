import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from '@shared/modules/layout/layout.module';
import { provideNzI18n } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { CoreModule } from '@core/core.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { NgIdleKeepaliveModule, provideNgIdleKeepalive } from '@ng-idle/keepalive';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CoreModule,
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    FormsModule,
    ToastrModule.forRoot({
      toastClass: 'ngx-toastr w-toastr'
    }),
    NgxPermissionsModule.forRoot(),
    NgIdleKeepaliveModule.forRoot(),
    RxReactiveFormsModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  providers: [
    provideNzI18n(en_US),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideNgIdleKeepalive(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
