import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api';
import { PagedResult } from '../../../shared/models/paged-result';
import { Sp122, Sp122Request } from '../models/sp122';

/** HTTP მოთხოვნები SP-122-ის API-ზე (NsiManager.Api/Controllers/Sp122Controller.cs). */
@Injectable({ providedIn: 'root' })
export class Sp122ApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/sp122`;

  getList(search: string, page: number, pageSize: number): Observable<PagedResult<Sp122>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PagedResult<Sp122>>(this.url, { params });
  }

  insert(request: Sp122Request): Observable<Sp122> {
    return this.http.post<Sp122>(this.url, request);
  }

  update(prkey: number, request: Sp122Request): Observable<Sp122> {
    return this.http.put<Sp122>(`${this.url}/${prkey}`, request);
  }

  delete(prkey: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${prkey}`);
  }
}
