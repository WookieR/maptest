import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastCtrl: ToastController){}

  async showAlertToast(msg: string){
    const toast = await this.toastCtrl.create({
      color: 'danger',
      message: msg
    });
    toast.present();
  }
}
