import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import * as mapboxgl from 'mapbox-gl';
import { RouteService } from '../services/route.service';
import { getSelfMarker } from '../helpers/self-marker';
import { MapFollowService } from './map-follow.service';
import { LocalstorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  geolocationWatch: any;
  currentCoords: Position | null;
  selfMarker: mapboxgl.Marker;
  recalculateCounter: number = 0;

  constructor (private routeService: RouteService,
              private localStorage: LocalstorageService) {}

  async getCurrentPosition() {
    const position = await Geolocation.getCurrentPosition({enableHighAccuracy: true});

    return position;
  }

  async initGeolocationWatch(updateCoordsFunc: Function, map: any) {
    this.geolocationWatch = await Geolocation.watchPosition({enableHighAccuracy: true}, async (position) => {
      this.currentCoords = position;
      if(!this.selfMarker){
        const currentPositionMarker = new mapboxgl.Marker({
          element: getSelfMarker(),
          scale: 1.3
        });
  
        this.selfMarker = currentPositionMarker;

        if(position) {
          this.selfMarker.setLngLat([position?.coords.longitude, position?.coords.latitude]);
        } 

        this.selfMarker.addTo(map);

        map.flyTo({
          center: [position?.coords.longitude, position?.coords.latitude],
          speed: 0.8,
          curve: 1
        })

      } else {
        if (position) this.selfMarker.setLngLat([position?.coords.longitude, position?.coords.latitude]);

        if(this.routeService.objectiveCoords != null) await this.routeService.recalculateRoute(position?.coords.longitude + ',' + position?.coords.latitude, map);
      }
    });
  }
}
