import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-select-sale-popover',
  templateUrl: './select-sale-popover.component.html',
  styleUrls: ['./select-sale-popover.component.scss'],
  imports: [IonicModule]
})
export class SelectSalePopoverComponent  implements OnInit {

  @Input() visits: any[] = []

  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {
  }

  select(visit: any) {
    this.popoverCtrl.dismiss(visit, 'select');
  }

  close() {
    this.popoverCtrl.dismiss(null, 'cancel');
  }

}
