import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, skip } from 'rxjs/operators';
import { AuthorizationService } from '@core/services/authorization.service';
import { ToastrService } from 'ngx-toastr';
import { LABELS } from '@shared/constants/labels.const';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  private readonly authService = inject(AuthorizationService);
  private readonly toast = inject(ToastrService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.includes('/oauth/token')) {
      return next.handle(request);
    }

    // Get token from localStorage
    const token = localStorage.getItem('id_token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const skipErrorsArr = [
          'metering/uploadData'
        ];

        const shouldSkipErr = skipErrorsArr.some(urlStr => request.url.includes(urlStr));

        if (shouldSkipErr) {
          return throwError(() => error);
        }

        if(request.url.includes('metering/uploadData"'))

        switch (error.status) {
          case 401: {
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
              this.authService.logout();
            }
            break;
          }
          case 400:
          case 500:
            console.log({request})
            this.toast.error(error?.error?.message || '', error?.error?.error || LABELS.ERROR);
            break;
        }

        return throwError(() => error);
      })
    );
  }
}