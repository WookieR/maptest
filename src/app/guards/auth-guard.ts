import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LocalstorageService } from '../stores/localstorage.service';
import { GeolocationService } from '../stores/geolocation.service';
import { Preferences } from '@capacitor/preferences';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const localStorageService = inject(LocalstorageService);
  const geolocationService = inject(GeolocationService);
  const router = inject(Router);
  
  try{
    const token = await localStorageService.getToken()

    const resp: any = await authService.renew(token ?? '');

    await localStorageService.setToken(resp.result.token);

    return true;

  } catch (e) {

    // await localStorageService.clearStorage();

    router.navigate(['auth']);
    await Preferences.remove({key: 'clients'});
    return false;

  }
};
