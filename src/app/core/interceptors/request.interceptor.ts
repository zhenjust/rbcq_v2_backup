import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  private readonly authService = inject(AuthorizationService);
  private readonly toast = inject(ToastrService);

  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  refreshTokenInProgress = false;

  private applyCredentials = (request: HttpRequest<any>) => {
    const token = this.authService.getToken();
    const excludeUrl = /assets/gi;

    if (token && request.url.search(excludeUrl) === -1) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return request;
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.includes('/oauth/token')) {
      return next.handle(request);
    } else {
      request = this.applyCredentials(request);
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

        switch (error.status) {
          case 401: {
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
              if (this.refreshTokenInProgress) {

                return this.refreshTokenSubject.pipe(
                  filter((token) => token !== null),
                  take(1),
                  switchMap((token) => {
                    if (token) {
                      return next.handle(this.applyCredentials(request));
                    }

                    return of()
                  }));
              } else {
                this.refreshTokenInProgress = true;
                this.refreshTokenSubject.next(null);
                localStorage.removeItem('id_token');

                return this.authService.refreshToken(refreshToken)
                  .pipe(
                    switchMap((oauth: any) => {
                      const newToken = oauth.access_token;
                      if (newToken) {
                        this.refreshTokenSubject.next(newToken);
                        return next.handle(this.applyCredentials(request));
                      }

                      this.authService.logout()
                      return of();
                    }),
                    catchError((e) => {
                      this.authService.logout()

                      return throwError(e);
                    }),
                    finalize(() => {
                      this.refreshTokenInProgress = false;
                    })
                  );
              }
            }

            break;
          }
          case 400:
          case 500:
            this.toast.error(error?.error?.message || error?.error?.error || '');
            break;
        }

        return throwError(() => error);
      })
    );
  }
}
