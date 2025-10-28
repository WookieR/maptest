import { Component, OnInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-payment-delete-popover',
  templateUrl: './payment-delete-popover.component.html',
  styleUrls: ['./payment-delete-popover.component.scss'],
  imports: [IonicModule]
})
export class PaymentDeletePopoverComponent  implements OnInit {

  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {}

  confirm() {
    this.popoverCtrl.dismiss(true, 'dismiss');
  }

  close() {
    this.popoverCtrl.dismiss(false, 'dismiss');
  }

}
