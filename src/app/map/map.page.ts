import { Component, EventEmitter, OnInit } from '@angular/core';

import { Geolocation, Position } from '@capacitor/geolocation';
import * as mapboxgl from 'mapbox-gl';

import { VisitService } from '../services/visit.service';
import { VisitMarker } from '../interfaces/visit-marker';
import { LoadingController, ModalController, NavController, Platform, PopoverController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { VisitModalComponent } from '../components/modals/visit-modal/visit-modal.component';
import { PermissionService } from '../stores/permission.service';
import { GeolocationService } from '../stores/geolocation.service';
import { RouteService } from '../services/route.service';
import { ClientsModalComponent } from '../components/modals/clients-modal/clients-modal.component';
import { haversineDistanceKM } from '../helpers/distance';
import { MapFollowService } from '../stores/map-follow.service';
import { calcBoundsFromCoordinates } from '../helpers/bound-coordinates';
import { determineColor, determineMultimarkerColor } from '../helpers/marker-color';
import { LocalstorageService } from '../stores/localstorage.service'
import { Router } from '@angular/router';
import { SelectSalePopoverComponent } from '../components/popovers/select-sale-popover/select-sale-popover.component';
import { App } from '@capacitor/app';
import { Observable, Subscription } from 'rxjs';
import { getSelfMarker } from '../helpers/self-marker';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, ViewWillEnter, ViewWillLeave {

  positionWatch: any;
  map: mapboxgl.Map | null = null;
  visits: any[] = [];
  markers: VisitMarker[] = [];
  currentPositionMarker: mapboxgl.Marker | null = null;
  arrangeInterval: any;
  backButtonSubscription: Subscription
  selfMarker: mapboxgl.Marker;
  position: Position;

  constructor(private permissionService: PermissionService,
              private geolocationService: GeolocationService,
              private mapFollowService: MapFollowService,
              private routeService: RouteService,
              private localStorage: LocalstorageService,
              // private visitService: VisitService,
              private modalCtrl: ModalController,
              private popoverCtrl: PopoverController,
              private loadingCtrl: LoadingController,
              private platform: Platform) {
  }
  
  ionViewWillEnter(): void {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(110, () => {
      App.minimizeApp();
    });
  }
  
  ionViewWillLeave(): void {
    if(this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe()
    }
  }

  async ngOnInit() {
    const platform = await this.permissionService.getPlatform();

    const status = await this.permissionService.getGeolocationPermissionStatus(platform);

    if(status) {
      // await this.geolocationService.getCurrentPosition();
      // this.geolocationService.initGeolocationWatch(this.updateCoords, this.map)
      Geolocation.watchPosition({enableHighAccuracy: true}, (position) => {
        if(!position) return;

        this.position = position;
        
        this.updateCoords(position);
      })
    }
    
    this.initializeMap();
    this.getClients();
  }

  updateCoords(position: Position) {
    if(this.selfMarker){
      this.selfMarker.setLngLat([position.coords.longitude, position.coords.latitude]);
    } else {
      const selfMarker = new mapboxgl.Marker({
        element: getSelfMarker(),
        scale: 1.3
      }).setLngLat([position.coords.longitude, position.coords.latitude]).addTo(this.map!);
  
      this.selfMarker = selfMarker
    }

    // this.rearrangeClients(position);
  }

  async initializeMap() {
    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoid29va2llciIsImEiOiJjbWZpeGp0cjUwY2lwMmtwdnFwYnN6eTIxIn0.eMs3r09QHZyIgZ5f6UfIjQ'; // Cast to any to avoid TypeScript errors
    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      // style: { version: 8, sources: {}, layers: [] },
      style: 'mapbox://styles/wookier/cmj1sqbut007d01s2dw1scl3n',
      center: [-65.2064410002705, -26.829806637711094], // starting position [lng, lat]
      zoom: 15, // starting zoom,
      pitch: 20
    });

    this.map.addControl(new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true
    }));

    this.map.on("load", () => {
      window.dispatchEvent(new Event("resize"));
    });

    this.map.setConfigProperty('basemap', 'show3dObjects', false);

    // this.map.dragRotate.disable();
    // this.map.touchZoomRotate.disable();
    // this.map.rotate
    this.map.touchZoomRotate.disableRotation();
  }

  async getClients() {
    let clients = await this.localStorage.getClients();
    this.visits.push(...clients);

    this.createMarkers();
  }
  
  createMarkers() {
    this.visits.forEach((client, index) => {
      const marker = new mapboxgl.Marker({
        scale: 1.2,
        color: client.sales.length > 1 ? determineMultimarkerColor(client.sales) : 
                                        client.sales[0].visit.visit_result != null || client.sales[0].visit.visit_result != undefined ? client.sales[0].visit.visit_result.color : '#0269c2'
        // color: client.sales[0].visit.visit_result != null || client.sales[0].visit.visit_result != undefined ? client.sales[0].visit.visit_result.color : '#0269c2'
      }).setLngLat(client.location_longlat.split(','))

      marker.getElement().addEventListener('click', () => {
        this.markerClicked(client, index);
      })

      marker.addTo(this.map!);
      client.marker = marker;
    })
  }

  async markerClicked(client: any, visitIndex: any) {
    if(client.sales.length > 1){
      const selectSaleDialog = await this.popoverCtrl.create({
        component: SelectSalePopoverComponent,
        backdropDismiss: true,
        componentProps: {
          client: client
        }
      });
      selectSaleDialog.present();

      const { data: index } = await selectSaleDialog.onDidDismiss();

      if(index == null) return;

      const visitDialog = await this.modalCtrl.create({
        component: VisitModalComponent,
        componentProps: {
          client: {
            ...client,
          },
          saleIndex: index
        }
      })

      visitDialog.present();


      const { data: result } = await visitDialog.onDidDismiss();

      if(result == null) return;

      this.updateMarker(visitIndex, result);

      await this.localStorage.updateClientsInMemory(this.visits);

    } else {

      const visitDialog = await this.modalCtrl.create({
        component: VisitModalComponent,
        componentProps: {
          client: {
            ...client
          },
          saleIndex: 0
        }
      });
      visitDialog.present();

      const { data: result } = await visitDialog.onDidDismiss();

      if(result == null) return;

      this.updateMarker(visitIndex, result);

      await this.localStorage.updateClientsInMemory(this.visits);
    }
  }

  updateMarker(visitIndex: any, visitResult: any) {

    const client: any = this.visits[visitIndex];
    this.visits[visitIndex].marker.remove();
  
    const newMarker = new mapboxgl.Marker({
      color: client.sales.length < 2 ? visitResult.color : determineMultimarkerColor(client.sales),
      scale: 1.2
    }).setLngLat(this.visits[visitIndex].location_longlat.split(','));
    newMarker.addTo(this.map!);
    newMarker.getElement().addEventListener('click', () => {
      this.markerClicked(this.visits[visitIndex], visitIndex);
    });

    this.visits[visitIndex].marker = newMarker;

  }

  async openClientsSheetModal() {

    const clientsModal: any = await this.modalCtrl.create({
      component: ClientsModalComponent,
      componentProps: {
        visits: this.visits,
        position: this.position
      },
      
      cssClass: 'opacity'
    });
  
    clientsModal.present()

    const { data, role } = await clientsModal.onDidDismiss();

    if(role == 'flyto'){
      this.map?.flyTo({
        center: data.location_longlat.split(','),
        speed: 2,
        curve: 0.8,
        zoom: 18
      });
    }
  }

  async logout() {
    await Preferences.remove({key: 'clients'});
    await Preferences.remove({key: 'token'});
    window.location.reload();
  }
}
