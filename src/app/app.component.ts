import { Component, OnInit } from '@angular/core';
import { OfflinePayService } from './services/offline-pay.service';
import { VisitService } from './services/visit.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { ToastService } from './services/toast.service';
import { TimeoutError } from 'rxjs';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { LocationService } from './services/location.service';
import { Geolocation, Position } from '@capacitor/geolocation';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private offlinePayService: OfflinePayService,
              private visitService: VisitService,
              private toastService: ToastService,
              private locationService: LocationService,
              private platform: Platform
  ) {}

  async ngOnInit() {

    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(100, () => {
        // Do nothing to disable the back button functionality
        console.log('no anda el back')
      });
    })

    await this.offlinePayService.initPayments();
    this.offlinePayService.syncPayments().subscribe(async (resp) => {
      try{
        if(resp == undefined || resp == null) return;

        const finishVisitResp: any = await this.visitService.finishVisit(resp.newPayments,
                                                                        resp.newSimplePayments,
                                                                        resp.visitId,
                                                                        resp.comment,
                                                                        resp.token,
                                                                        true);

        if(finishVisitResp.success){
          console.log('pago aceptado... borrando de memoria');
          await this.offlinePayService.removePayment();
          return;
        }

      } catch (e) {

        if(e instanceof HttpErrorResponse){
          if(e.error.message == 'visita ya registrada'){
            console.log('borrar pago ya registrado');
            await this.offlinePayService.removePayment();
            return;
          }

          if(e.error instanceof ProgressEvent){
            console.log('No se pudo establecer conexion con el servidor... se reintentara en unos momentos');
            return;
          }
        }

        if(e instanceof TimeoutError){
          console.log('No se pudo establecer conexion con el servidor... se reintentara en unos momentos');
          return;
        }
      }
    });

    Geolocation.watchPosition({enableHighAccuracy: true}, async(position) => {
      if(!position) return;
      await this.locationService.emitLocation(position);
    })
  }


}
