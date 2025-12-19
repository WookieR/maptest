import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { IonicModule, Platform, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-delete-popover',
  templateUrl: './payment-delete-popover.component.html',
  styleUrls: ['./payment-delete-popover.component.scss'],
  imports: [IonicModule]
})
export class PaymentDeletePopoverComponent  implements OnInit {

  backButtonSubscription: Subscription

  constructor(private popoverCtrl: PopoverController, private platform: Platform) { }
  

  ngOnInit() {
    // App.addListener('backButton', () => {
    //   this.close();
    // })
  }

  ionViewWillEnter(): void {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(130, () => {
      this.close();
    });
  }
  
  ionViewWillLeave(): void {
    if(this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe()
    }
  }

  confirm() {
    this.popoverCtrl.dismiss(true, 'dismiss');
  }

  close() {
    this.popoverCtrl.dismiss(false, 'dismiss');
  }

}
