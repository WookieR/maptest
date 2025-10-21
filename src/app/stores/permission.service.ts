import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  async getPlatform() {
    const platform = await Capacitor.getPlatform();

    return platform;
  }

  async getGeolocationPermissionStatus(platform: string) {
    if(platform == 'web') {
      return true;
    } else {
      const status = await Geolocation.checkPermissions();
      
      if(status.location == 'prompt') {
        const promptResult = await Geolocation.requestPermissions();

        if(promptResult.location == 'granted' && promptResult.coarseLocation == 'granted'){
          return true;
        }

        return false;
      }

      if(status.location == 'granted') {
        return true;
      }

      return false;
    }
  }
  
}
