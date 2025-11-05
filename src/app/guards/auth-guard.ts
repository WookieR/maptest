import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LocalstorageService } from '../stores/localstorage.service';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const localStorageService = inject(LocalstorageService);
  const router = inject(Router);
  
  try{
    const token = await localStorageService.getToken()

    console.log(token)

    const resp: any = await authService.renew(token ?? '');

    await localStorageService.setToken(resp.result.token);

    return true;

  } catch (e) {
    await localStorageService.clearStorage();

    router.navigate(['auth']);

    return false;
  }
};
