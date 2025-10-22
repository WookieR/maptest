import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Position } from '@capacitor/geolocation';
import { firstValueFrom, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  private recalculateCounter: number = 0;

  private baseUrl: string = 'https://api.mapbox.com';
  private routeEndpoint: string = '/directions/v5/mapbox/driving-traffic/';
  private geometriesConfig: string = '?geometries=geojson';
  private accessToken: string = 'pk.eyJ1Ijoid29va2llciIsImEiOiJjbWZpeGp0cjUwY2lwMmtwdnFwYnN6eTIxIn0.eMs3r09QHZyIgZ5f6UfIjQ'

  objectiveCoords: string;

  constructor(private http: HttpClient){ }

  setObjective(coords: string) {
    this.objectiveCoords = coords;
  }

  async recalculateRoute(currentCoords: string, map: any, setNow = false) {
    if(this.objectiveCoords == '') return;

    if(!setNow && this.recalculateCounter < 5) {
      return this.recalculateCounter ++;
    }

    let routeCoords = '';
    routeCoords += currentCoords + ';' + this.objectiveCoords;

    let fullUrl = this.baseUrl + this.routeEndpoint + routeCoords + this.geometriesConfig + '&access_token=' + this.accessToken;

    const resp = await firstValueFrom( this.http.get<any>(fullUrl).pipe(take(1)) );

    const geojson = {
      'type': 'Feature',
      'properties': {},
      'geometry': resp.routes[0].geometry
    };

    this.addRouteToMap(map, geojson);

    this.recalculateCounter = 0

    return;
  }

  addRouteToMap(map: any, geojson: any) {
    if (map.getSource('route')) {
      // if the route already exists on the map, reset it using setData
      map.getSource('route').setData(geojson);
    } else {
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FF0000',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
  }
}
