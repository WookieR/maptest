import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.base_url;
  private loginEndpoint = '/auth/login';
  private renewEndpoint = '/auth/renew';

  constructor(private http: HttpClient){ }

  async login(dni: string) {
    const observable = this.http.post(this.baseUrl + this.loginEndpoint, {
      dni: dni
    }, {
      headers: {
        'ngrok-skip-browser-warning':'123456'
      }
    }).pipe(take(1));

    return await firstValueFrom(observable);
  }

  async renew(token: string) {
    const observable = this.http.get(this.baseUrl + this.renewEndpoint, {
      headers: {
        'ngrok-skip-browser-warning':'123456',
        'x-token': token
      }
    }).pipe(take(1));

    return await firstValueFrom(observable);
  }
}
