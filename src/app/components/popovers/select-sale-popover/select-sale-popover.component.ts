import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, Platform, PopoverController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-select-sale-popover',
  templateUrl: './select-sale-popover.component.html',
  styleUrls: ['./select-sale-popover.component.scss'],
  imports: [IonicModule]
})
export class SelectSalePopoverComponent  implements OnInit, ViewWillEnter, ViewWillLeave {

  @Input() client: any;
  backButtonSubscription: any;

  constructor(private popoverCtrl: PopoverController, private platform: Platform) { }

  ngOnInit() {
  }

  ionViewWillEnter(): void {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(120, () => {
      this.close();
    });
  }
  
  ionViewWillLeave(): void {
    if(this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe()
    }
  }

  select(index: any) {
    this.popoverCtrl.dismiss(index, 'select');
  }

  close() {
    this.popoverCtrl.dismiss(null, 'cancel');
  }

}
