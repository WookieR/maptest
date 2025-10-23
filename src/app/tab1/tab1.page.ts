import { Component, OnInit } from '@angular/core';

import { Position } from '@capacitor/geolocation';
import * as mapboxgl from 'mapbox-gl';

import { VisitService } from '../services/visit.service';
import { VisitMarker } from '../interfaces/visit-marker';
import { ModalController } from '@ionic/angular';
import { VisitModalComponent } from '../components/modals/visit-modal/visit-modal.component';
import { PermissionService } from '../stores/permission.service';
import { GeolocationService } from '../stores/geolocation.service';
import { RouteService } from '../services/route.service';
import { ClientsModalComponent } from '../components/modals/clients-modal/clients-modal.component';
import { haversineDistanceKM } from '../helpers/distance';
import { MapFollowService } from '../stores/map-follow.service';
import { calcBoundsFromCoordinates } from '../helpers/bound-coordinates';
import { determineColor } from '../helpers/marker-color';
import { LocalstorageService } from '../stores/localstorage.service'


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  positionWatch: any;
  map: mapboxgl.Map | null = null;
  visits: any[] = [];
  markers: VisitMarker[] = [];
  currentPositionMarker: mapboxgl.Marker | null = null;
  arrangeInterval: any;
  // markers: mapboxgl.Marker[] = [
  // ];

  constructor(private permissionService: PermissionService,
              private geolocationService: GeolocationService,
              private mapFollowService: MapFollowService,
              private routeService: RouteService,
              private localStorage: LocalstorageService,
              // private visitService: VisitService,
              private modalCtrl: ModalController
  ) {
  }

  async ngOnInit() {
    
    this.initializeMap();

    const platform = await this.permissionService.getPlatform();

    let permissionsGranted = await this.permissionService.getGeolocationPermissionStatus(platform);

    if(permissionsGranted) {
      
      const objective = await this.localStorage.getObjective();

      if(objective != null) {
        const currentPosition = await this.geolocationService.getCurrentPosition();

        this.routeService.setObjective(objective);
        const currentCoords = currentPosition.coords.longitude +
                            ',' +
                            currentPosition.coords.latitude;
        this.routeService.recalculateRoute(currentCoords, this.map, true);
        this.mapFollowService.setMode('route', this.map);

      }

      await this.geolocationService.initGeolocationWatch(this.updateCoords, this.map);
      this.getVisits();
    }
  }

  updateCoords(position: Position) {
    const selfMarker = new mapboxgl.Marker({
      element: document.createElement('div'),
      className: 'self-position-marker'
    }).setLngLat([position.coords.longitude, position.coords.latitude])
  }

  async initializeMap() {
    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoid29va2llciIsImEiOiJjbWZpeGp0cjUwY2lwMmtwdnFwYnN6eTIxIn0.eMs3r09QHZyIgZ5f6UfIjQ'; // Cast to any to avoid TypeScript errors
    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      // style: 'mapbox://styles/mapbox/streets-v11', // style URL
      // style: 'mapbox://styles/mapbox/streets-v12',
      style: 'mapbox://styles/wookier/cmh0o168j000h01qk0j3713e8',
      center: [-65.2064410002705, -26.829806637711094], // starting position [lng, lat]
      zoom: 15 // starting zoom,
    });

    this.map.addControl(new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true
    }));

    this.map.on("load", () => {
      window.dispatchEvent(new Event("resize"));
    });

    this.map.on("dragstart", () => {
      this.mapFollowService.addFreeMoveTime();
    });

    this.map.on("dragend", () => {
      this.mapFollowService.addFreeMoveTime();
    });
  }

  async getVisits() {
    const visits = await this.localStorage.getVisits();
    this.visits.length = 0;
    this.visits.push(...visits);

    this.createMarkers();
    this.rearrangevisits();
    this.startRearrangeInterval();
  }

  startRearrangeInterval(){
    this.arrangeInterval = setInterval(() => {
      this.rearrangevisits();
    }, 10000)
  };

  rearrangevisits() {

    this.visits.map((visit) => {
      const distance = haversineDistanceKM(this.geolocationService.currentCoords?.coords.longitude + 
                                            ',' +
                                            this.geolocationService.currentCoords?.coords.latitude,
                                            visit.sale.client.location_longlat);

      visit.distance = distance;

      return visit;
    });

    const visited = this.visits.filter((visit: any) => {
      return visit.visit_result != null;
    });

    const nonVisited = this.visits.filter((visit: any) => {
      return visit.visit_result == null;
    })

    this.sortByDistanceAsc(nonVisited);

    this.visits.length = 0;
    this.visits.push(...nonVisited, ...visited);
  }

  sortByDistanceAsc(array: any) {
    array.sort(function(a: any, b: any) {
      return parseFloat(a.distance) - parseFloat(b.distance);
    })
  }

  async markerClicked(visit: any, marker: mapboxgl.Marker){

    const modal = await this.modalCtrl.create({
      component: VisitModalComponent,
      cssClass: 'my-custom-modal',
      componentProps: {
        visit
      }
    })

    modal.present()

    const { data: visitResult } = await modal.onDidDismiss();

    if(visitResult == null) return;

    visit.visit_result = visitResult;
    const visitLongLat = visit.sale.client.location_longlat.split(',');

    await this.localStorage.setVisits(this.visits);
    await this.localStorage.clearObjective();

    marker.remove();
    marker = new mapboxgl.Marker({ color: visitResult.color, scale: 1.2 })
                                .setLngLat([visitLongLat[0], visitLongLat[1]]);

    marker.getElement().addEventListener("click", (event) => {
      this.markerClicked(visit, marker);
    });
                          
    if(this.map) marker.addTo(this.map);
    window.dispatchEvent(new Event("resize"));

    this.centerInSelf();
    this.routeService.objectiveCoords = '';

    if (this.map?.getLayer('route') != undefined){
      this.map?.removeLayer('route');
      this.map?.removeSource('route');
    }
    this.rearrangevisits();
    this.openClientsSheetModal();
  }

  createMarkers(): void {
      const markers: VisitMarker[] = this.visits.map((visit: any) => {
        const location_long = visit.sale.client.location_longlat.split(',')[0];
        const location_lat = visit.sale.client.location_longlat.split(',')[1]

        const payments = visit.visit_result == null ? null : visit.visit_result.payments;
        const targetAmount = visit.target_amount

        return {
          visit: visit,
          marker: new mapboxgl.Marker(
                          { color: determineColor(payments, targetAmount), scale: 1.2 }
                        ).setLngLat([location_long, location_lat])
        }
      });

      this.markers.push(...markers);

      this.markers.forEach((visitMarker: VisitMarker) => {
        visitMarker.marker.getElement().addEventListener("click", (event) => {
          this.markerClicked(visitMarker.visit, visitMarker.marker);
        });
      })

      this.addMarkersToMap();
  }

  setObjectiveClient(client: any){
    this.routeService.setObjective(client.location_longlat);
    const currentCoords = this.geolocationService.currentCoords?.coords.longitude +
                          ',' +
                          this.geolocationService.currentCoords?.coords.latitude;
    this.routeService.recalculateRoute(currentCoords, this.map, true);
  }

  addMarkersToMap(): void {
    this.markers.forEach((visitMarker: VisitMarker) => {
      if(this.map) {
        visitMarker.marker.addTo(this.map);
      }
    })
  }

  async openClientsSheetModal() {
    const clientsModal = await this.modalCtrl.create({
      component: ClientsModalComponent,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.25,
      componentProps: {
        visits: this.visits
      }
    });
    clientsModal.present()

    const { data } = await clientsModal.onDidDismiss();

    if(data == null) return;

    const { client, visited } = data

    if(client == null) return;

    if(!visited) {
      if(client) this.setObjectiveClient(client);
      this.mapFollowService.setMode('route', this.map);
    } else {
      this.mapFollowService.setMode('free', this.map);
      this.routeService.objectiveCoords = '';

      if (this.map?.getLayer('route') != undefined){
        this.map?.removeLayer('route');
        this.map?.removeSource('route');
      }

      this.map?.flyTo({
          center: [ client.location_longlat.split(',')[0], client.location_longlat.split(',')[1] ],
          speed: 0.8,
          curve: 1
      })
    }

  }

  changeMapFollowingMode(mode: 'route' | 'free') {
    this.mapFollowService.setMode(mode, this.map);
  }

  centerInSelf() {
    this.mapFollowService.centerInSelf(this.map);
  }
}
