import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { interval, share, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfflinePayService {
  private payments: any;

  constructor(private http: HttpClient) {

  }

  async initPayments() {
    if(this.payments == null || this.payments == undefined){
      const paymentsFromMemory = await Preferences.get({key: 'payments-queue'});
      this.payments = paymentsFromMemory.value == null || paymentsFromMemory.value == undefined ? [] : JSON.parse(paymentsFromMemory.value!);
    }

  }

  async addPayment(payment: any) {
    this.payments.push(payment);
    await Preferences.set({key: 'payments-queue', value: JSON.stringify(this.payments)});
  }

  syncPayments() {
    return interval(15000).pipe(
      switchMap(async() => {
        return this.payments.find(() => true);
      }),
      share()
    )
  }

  emitLocation() {
    return interval(15000).pipe(
      switchMap(async() => {
        return 'emit'
      }),
      share()
    )
  }

  async removePayment() {
    this.payments.splice(0, 1);
    await Preferences.set({key: 'payments-queue', value: JSON.stringify(this.payments)});
  }
}
