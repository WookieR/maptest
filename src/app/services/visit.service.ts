import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private baseUrl = 'https://c2f6586e0111.ngrok-free.app/visits';

  constructor(private http: HttpClient){ }
  
  async getVisits(worker_id: string) {
    const query = "?worker_id=" + worker_id;
    
    const observable = this.http.get(this.baseUrl + query, {
      headers: {'ngrok-skip-browser-warning':'123456'}
    }).pipe(take(1));

    return await firstValueFrom(observable)
  }

  getVisit(visitId: string) {
    const param = "/" + visitId;

    return this.http.get(this.baseUrl + param, {
      headers: {'ngrok-skip-browser-warning':'123456'}
    }).pipe(take(1));
  }

  finishVisit(newPayments: any[], visitId: number, comment = null){
    return this.http.post(this.baseUrl, {
      visit_id: visitId,
      quota_payments: newPayments,
      commentary: comment
    }, {
      headers: {'ngrok-skip-browser-warning':'123456'}
    }).pipe(take(1));
  }
}
