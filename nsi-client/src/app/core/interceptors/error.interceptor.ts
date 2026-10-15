import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../../shared/alert/alert.service';
import { ApiError } from '../../shared/models/api-error';

/**
 * ყველა HTTP შეცდომას ალერტად აჩვენებს.
 * API ყოველთვის აბრუნებს { "message": "..." } — ბაზის ქართული შეტყობინებით (THROW 50001/50002/50004).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alerts = inject(AlertService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        alerts.error(messageFor(error));
      }
      return throwError(() => error);
    }),
  );
};

function messageFor(error: HttpErrorResponse): string {
  if (error.status === 0 || error.status === 502 || error.status === 503 || error.status === 504) {
    return 'სერვერთან კავშირი ვერ დამყარდა. შეამოწმეთ, რომ API გაშვებულია.';
  }

  const body = error.error as Partial<ApiError> | null;
  if (body && typeof body.message === 'string' && body.message.length > 0) {
    return body.message;
  }

  return error.status === 404 ? 'მოთხოვნილი მონაცემი ვერ მოიძებნა' : 'მოხდა შეცდომა, სცადეთ მოგვიანებით';
}
