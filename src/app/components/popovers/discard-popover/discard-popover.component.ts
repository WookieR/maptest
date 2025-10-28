import { Component, OnInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-discard-popover',
  templateUrl: './discard-popover.component.html',
  styleUrls: ['./discard-popover.component.scss'],
  imports: [IonicModule]
})
export class DiscardPopoverComponent  implements OnInit {

  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {}

  confirm() {
    this.popoverCtrl.dismiss(true, 'dismiss');
  }

  close() {
    this.popoverCtrl.dismiss(false, 'dismiss');
  }
}
