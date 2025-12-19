import { Component, EventEmitter, Input, OnInit, output, Output } from '@angular/core';
import { App } from '@capacitor/app';
import { Position } from '@capacitor/geolocation';
import { IonicModule, ModalController, Platform, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { haversineDistanceKM } from 'src/app/helpers/distance';

@Component({
  selector: 'app-client-modal',
  templateUrl: './clients-modal.component.html',
  styleUrls: ['./clients-modal.component.scss'],
  imports: [IonicModule]
})
export class ClientsModalComponent implements OnInit, ViewWillEnter, ViewWillLeave {
  @Input() visits: any;
  @Input() position: any;
  clients: any;
  private backButtonSubscription: Subscription;

  constructor(private modalCtrl: ModalController,
              private platform: Platform
  ) { }

  
  ionViewWillEnter(): void {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(120, () => {
      console.log('Custom hardware back button action!');
      this.modalCtrl.dismiss(null, 'cancel');
    });
  }
  
  ionViewWillLeave(): void {
    if(this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe()
    }
  }

  ngOnInit() {
    this.clients = [...this.visits];
    this.rearrangeClients(this.position)
  }

  async rearrangeClients(position: Position) {
    if(!position) return;
    this.clients.map((visit: any) => {
      const distance = haversineDistanceKM(position.coords.longitude + 
                                          ',' +
                                          position.coords.latitude,
                                          visit.location_longlat);
                                          visit.distance = distance;

      visit.distance = distance
      return visit;
    });

    this.sortByDistanceAsc(this.clients);
    console.log(this.clients);
  }

  sortByDistanceAsc(array: any) {
    array.sort(function(a: any, b: any) {
      return parseFloat(a.distance) - parseFloat(b.distance);
    })
  }

  flyToClient(visit: any) {
    this.modalCtrl.dismiss(visit, 'flyto');
  }

  markAsPending(visit: any) {
    visit.pending = true;
    this.modalCtrl.dismiss(null, 'markedAsPending');
  }

}
