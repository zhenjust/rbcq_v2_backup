import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthorizationService } from '@core/services/authorization.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthorizationService) {}
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    //TODO once request is validating, delete this
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
        if (error.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');
          
          if(refreshToken){
            this.authService.logout();
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}