import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { VisitService } from '../services/visit.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {
  visits: any = [];
  objective: string | null = null;
  token: string | null;

  constructor(private visitService: VisitService, private router: Router) {
    
  }

  async setToken(token: string) {
    this.token = token;
    await Preferences.set({key: 'token', value: token});
  }

  async clearStorage() {
    this.visits = [];
    this.token = null,
    await Preferences.clear()
  }

  async getToken(){
    if(!this.token) {
      this.token = (await Preferences.get({key: 'token'})).value;
    }

    return this.token;
  }

  async getVisits() {
    if(this.visits.length < 1) await this.setVisits();

    return this.visits;
  }

  async setVisits(visits: any = null) {
    if(visits) {
      await Preferences.set({
        key: 'visits',
        value: JSON.stringify(visits)
      });

      this.visits.length = 0;
      this.visits.push(...visits);
      return;
    }

    const { value: visitsFromStorage } = await Preferences.get({key: 'visits'});

    if(visitsFromStorage != null){
      this.visits.length = 0;
      this.visits.push(...JSON.parse(visitsFromStorage));
      return;
    }

    try {
      const response: any = await this.visitService.getVisits(this.token ?? '');
  
      await Preferences.set({
        key: 'visits',
        value: JSON.stringify(response.result)
      });
  
      this.visits.push(...response.result);
  
      return;
    } catch (e) {
      await Preferences.clear();
      this.router.navigate(['auth'])
    }
  }

  async getObjective() {
    const { value: objective } = await Preferences.get({key: 'objective'});

    return objective;
  }

  async setObjective(coords: string) {
    await Preferences.set({
      key: 'objective',
      value: coords
    });
  }

  async clearObjective() {
    await Preferences.remove({key: 'objective'});
  }
  
}
