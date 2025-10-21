import { Injectable } from '@angular/core';
import { GeolocationService } from './geolocation.service';
import { RouteService } from '../services/route.service';
import { calcBoundsFromCoordinates } from '../helpers/bound-coordinates';

@Injectable({
  providedIn: 'root'
})
export class MapFollowService {
  private mode: string;
  private activeInterval: any;

  constructor(private geolocationService: GeolocationService,
              private routeService: RouteService,
  ) {
    this.mode = 'free';
  }

  setMode(mode: 'free' | 'route', map: any){
    this.mode = mode;

    clearInterval(this.activeInterval);

    if(this.mode == 'route') {
      this.routeModeProcess(map);
      this.routeModeStart(map);
    }
  }

  centerInSelf(map: any) {
    this.mode = 'free';

    clearInterval(this.activeInterval);

    map.flyTo({
      center: [this.geolocationService.currentCoords?.coords.longitude, this.geolocationService.currentCoords?.coords.latitude],
      speed: 0.8,
      curve: 1
    });
  }

  routeModeStart(map: any) {
    this.activeInterval = setInterval(() => {
      this.routeModeProcess(map);
    }, 4000);
  }

  routeModeProcess(map: mapboxgl.Map) {
    const result = calcBoundsFromCoordinates([
      [this.geolocationService.currentCoords?.coords.longitude, this.geolocationService.currentCoords?.coords.latitude],
      [this.routeService.objectiveCoords.split(',')[0], this.routeService.objectiveCoords.split(',')[1]]
    ])
  
    map.fitBounds(result, {padding: {top: 150, bottom: 150, left: 50, right: 50}})
  }
  
}
