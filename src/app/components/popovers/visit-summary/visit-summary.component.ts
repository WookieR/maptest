import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.scss'],
  imports: [ IonicModule ]
})
export class VisitSummaryComponent  implements OnInit {
  @Input() quotas: any;

  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {
    this.quotas = this.quotas.filter((quota: any) => {
      // quota.quota_payments = quota.quota_payments.filter((quota_payment: any) => {
      //   return quota_payment.created_date == null
      // });

      return quota.quota_payments.length > 0
    })
  }

  close(){
    this.popoverCtrl.dismiss(false, 'dismiss');
  }

  confirm(){
    this.popoverCtrl.dismiss(true, 'dismiss');
  }

}
