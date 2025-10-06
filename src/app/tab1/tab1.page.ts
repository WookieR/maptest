import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Route } from '../services/route';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  map: mapboxgl.Map | null = null;
  markers: mapboxgl.Marker[] = [
    new mapboxgl.Marker()
                .setLngLat([-65.160842, -26.856323])
                .setPopup(new mapboxgl.Popup()
                .setHTML("<h1 style='color: gray'>El alfa</h1>")),
    new mapboxgl.Marker()
                .setLngLat([-65.15720667975896, -26.85527562778581])
                .setPopup(new mapboxgl.Popup()
                .setHTML("<h1 style='color: gray'>Fredo</h1>"))
    // new mapboxgl.Marker()
    // new mapboxgl.Marker()
    //             .setLngLat([-65.16196870081968, -26.840254361283453])
    //             .setPopup(new mapboxgl.Popup()
    //             .setHTML("<h1 style='color: gray'>Plaza la Banda</h1>")),
  ];

  constructor(private routeService: Route) {}

  async ngOnInit(): Promise<any> {
    this.initializeMap();

    this.initializeMarkers();

    this.initializeRoute();
  }

  initializeMap(): void {
    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoid29va2llciIsImEiOiJjbWZpeGp0cjUwY2lwMmtwdnFwYnN6eTIxIn0.eMs3r09QHZyIgZ5f6UfIjQ'; // Cast to any to avoid TypeScript errors
    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      // style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [-65.160842, -26.856323], // starting position [lng, lat]
      zoom: 20 // starting zoom
    });

    this.map.on("load", () => {window.dispatchEvent(new Event("resize"));});
  }

  initializeMarkers(): void {
    this.markers.forEach((marker) => {
      if(this.map != null) marker.addTo(this.map);
    });
  }

  initializeRoute(): any{
    let coords: string[] = [];

    this.markers.forEach(marker => {
      coords.push( marker.getLngLat().lng.toString() + ',' + marker.getLngLat().lat.toString() );
    });

    let coordsString = coords.join(';');

    this.routeService.getRoute(coordsString).subscribe({next: (resp: any) => {
      let geometry = resp.routes[0].geometry;
      const geojson: any = {
        'type': 'Feature',
        'properties': {},
        'geometry': geometry
      };
      console.log(geojson);

      this.map?.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ff0000',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });

    }});
  }

}
