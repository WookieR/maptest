import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { first, firstValueFrom, switchMap, take, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalstorageService } from '../stores/localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private baseUrl = environment.base_url;
  private visitEndpoint = '/visits';

  constructor(private http: HttpClient){

  }
  
  async getVisits(token: string) {
    const observable = this.http.get(this.baseUrl + this.visitEndpoint, {
      headers: {'ngrok-skip-browser-warning':'123456', 'x-token': token}
    }).pipe(take(1));

    return await firstValueFrom(observable)
  }

  async getVisit(visitId: string, token: string) {
    const param = "/" + visitId;

    const observable = this.http.get(this.baseUrl + this.visitEndpoint + param, {
      headers: {'ngrok-skip-browser-warning':'123456', 'x-token': token}
    }).pipe(take(1));

    return await firstValueFrom(observable);
  }

  async finishVisit(newPayments: any[], newSimplePayments: any[], visitId: number, comment = null, token: string){
    const observable = this.http.post(this.baseUrl + this.visitEndpoint, {
      visit_id: visitId,
      quota_payments: newPayments,
      payments: newSimplePayments,
      commentary: comment
    }, {
      headers: {'ngrok-skip-browser-warning':'123456', 'x-token': token}
    }).pipe(take(1), timeout(20000));

    return await firstValueFrom(observable);
  }
}
