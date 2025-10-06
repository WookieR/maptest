import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Route {

  private baseUrl: string = 'https://api.mapbox.com';
  private routeEndpoint: string = '/directions/v5/mapbox/driving-traffic/';
  private geometriesConfig: string = '?geometries=geojson';
  private accessToken: string = 'pk.eyJ1Ijoid29va2llciIsImEiOiJjbWZpeGp0cjUwY2lwMmtwdnFwYnN6eTIxIn0.eMs3r09QHZyIgZ5f6UfIjQ'

  constructor(private http: HttpClient){ }

  getRoute(coords: string) {
    let fullUrl = this.baseUrl + this.routeEndpoint + coords + this.geometriesConfig + '&access_token=' + this.accessToken;

    return this.http.get<any>(fullUrl).pipe(take(1));
  }
}
