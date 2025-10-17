import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { VisitService } from '../services/visit.service';
import { VisitMarker } from '../interfaces/visit-marker';
import { ModalController } from '@ionic/angular';
import { VisitModalComponent } from '../components/modals/visit-modal/visit-modal.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  map: mapboxgl.Map | null = null;
  visits: any[] = [];
  markers: VisitMarker[] = [];
  // markers: mapboxgl.Marker[] = [
  // ];

  constructor(private visitService: VisitService,
              private modalCtrl: ModalController
  ) {
  }

  async ngOnInit(): Promise<any> {
    this.initializeMap();

    this.getVisits();

    // this.visitService.getVisits("1").subscribe((resp) => {
      
    // });
  }

  initializeMap(): void {
    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoid29va2llciIsImEiOiJjbWZpeGp0cjUwY2lwMmtwdnFwYnN6eTIxIn0.eMs3r09QHZyIgZ5f6UfIjQ'; // Cast to any to avoid TypeScript errors
    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      // style: 'mapbox://styles/mapbox/streets-v12',
      center: [-65.2064410002705, -26.829806637711094], // starting position [lng, lat]
      zoom: 12 // starting zoom
    });

    this.map.on("load", () => {
      window.dispatchEvent(new Event("resize"));
    });
  }

  getVisits(): void {
    this.visitService.getVisits("1").subscribe((resp: any) => {
      this.visits.push(...resp.result)
      this.createMarkers();
    })
  }

  async markerClicked(visit: any){
    console.log(visit);
    const modal = await this.modalCtrl.create({
      component: VisitModalComponent,
      cssClass: 'my-custom-modal',
      componentProps: {
        visit
      }
    })

    modal.present()
  }

  createMarkers(): void {
      const markers: VisitMarker[] = this.visits.map((visit: any) => {
        const location_long = visit.sale.client.location_longlat.split(',')[0];
        const location_lat = visit.sale.client.location_longlat.split(',')[1]

        return {
          visit: visit,
          marker: new mapboxgl.Marker(
                          { color: visit.visit_result != null ? "#259b24" : "#e51c23", scale: 1.3 }
                        ).setLngLat([location_long, location_lat])
        }
        // return new mapboxgl.Marker()
        //                   .setLngLat([location_long, location_lat])
      });

      this.markers.push(...markers);

      this.markers.forEach((visitMarker: VisitMarker) => {
        visitMarker.marker.getElement().addEventListener("click", (event) => {
          this.markerClicked(visitMarker.visit);
        });
      })

      this.addMarkersToMap();
  }

  addMarkersToMap(): void {
    this.markers.forEach((visitMarker: VisitMarker) => {
      if(this.map) {
        visitMarker.marker.addTo(this.map);
      }
    })
  }
}
