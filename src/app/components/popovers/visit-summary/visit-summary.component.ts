import { Component, Input, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { IonicModule, Platform, PopoverController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.scss'],
  imports: [ IonicModule ]
})
export class VisitSummaryComponent  implements OnInit, ViewWillEnter, ViewWillLeave {
  @Input() payments: any;
  backButtonSubscription: Subscription

  constructor(private popoverCtrl: PopoverController,
              private platform: Platform
  ) { }

  ngOnInit() {
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

  close(){
    this.popoverCtrl.dismiss(false, 'dismiss');
  }

  confirm(){
    this.popoverCtrl.dismiss(true, 'dismiss');
  }

}
