import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { VisitService } from '../services/visit.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {
  clients: any[] = [];
  objective: string | null = null;
  token: string | null;

  constructor(private visitService: VisitService, private router: Router) {
    
  }

  async setToken(token: string) {
    this.token = token;
    await Preferences.set({key: 'token', value: token});
  }

  async getClients() {
    if(this.clients.length < 1){
      const clientsFromMemory = await Preferences.get({key: 'clients'});

      if(clientsFromMemory.value == null){
        const resp: any = await this.visitService.getVisits(this.token!);
        this.clients.push(...resp.result);
        await this.saveClients();
      } else {
        this.clients = JSON.parse(clientsFromMemory.value);
      }

      return this.clients;
    } else {
      return this.clients;
    }
  }

  async saveClients() {
    await Preferences.set({key: 'clients', value: JSON.stringify(this.clients)});
  }

  async updateClientsInMemory(clients: any) {
    this.clients.length = 0;
    this.clients.push(...clients.map((client: any) => {
      // delete client.marker;
      return {
        ...client,
        marker: null
      }
    }))
    await this.saveClients();
  }

  // async clearStorage() {
  //   this.visits = [];
  //   this.token = null,
  //   await Preferences.clear()
  // }

  async getToken(){
    if(!this.token) {
      this.token = (await Preferences.get({key: 'token'})).value;
    }

    return this.token;
  }
  
}
