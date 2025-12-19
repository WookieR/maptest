import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Position } from '@capacitor/geolocation';
import { firstValueFrom, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private baseUrl = environment.base_url;
  private visitEndpoint = '/location';

  constructor(private http: HttpClient){

  }

  async emitLocation(position: Position){
    const observable = this.http.post(this.baseUrl + this.visitEndpoint, {
      coords: position.coords
    }, {
      headers: {'ngrok-skip-browser-warning':'123456'}
    }).pipe(take(1));

    return await firstValueFrom(observable);
  }
  
}
