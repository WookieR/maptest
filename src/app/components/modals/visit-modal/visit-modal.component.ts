import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, PopoverController, ToastController } from "@ionic/angular";
import { VisitService } from 'src/app/services/visit.service';
import { PaymentPopoverComponent } from '../../popovers/payment-popover/payment-popover.component';
import { CommentaryPopoverComponent } from '../../popovers/commentary-popover/commentary-popover.component';
import * as moment from 'moment';
import { determineColor } from 'src/app/helpers/marker-color';

@Component({
  selector: 'app-visit-modal',
  templateUrl: './visit-modal.component.html',
  styleUrls: ['./visit-modal.component.scss'],
  imports: [IonicModule],
})
export class VisitModalComponent  implements OnInit {
  @Input() visit: any;

  newPayments: any = [];

  isLoading: boolean;

  detail: any;

  status: string;

  constructor(private modalCtrl: ModalController,
              private popoverCtrl: PopoverController,
              private visitService: VisitService,
              private toastCtrl: ToastController
  ) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.isLoading = true;

    this.visitService.getVisit(this.visit.id).subscribe((resp: any) => {
      this.isLoading = false;

      this.detail = resp.result;

      this.status = this.determineStatus(resp.result.visit_result);
    });
  }

  determineStatus(visitResult: any) {
    if(!visitResult) return 'Pendiente';

    const targetAmount = parseFloat(this.visit.target_amount);

    const totalPaid = visitResult.payments.reduce((accumulator: any, currentValue: any) => {
      return accumulator + parseFloat(currentValue.amount);
    }, 0.0);

    if(totalPaid == 0){
      return 'Impaga';
    }

    if(totalPaid < targetAmount){
      return 'Pago Parcial'
    }

    if(totalPaid >= targetAmount){
      return 'Pago Completo'
    }

    return 'Pendiente'
  }

  async openPaymentPopover(e: Event, quotaId: number) {

    const paymentPopover = await this.popoverCtrl.create({
      component: PaymentPopoverComponent,
      // event: e,
      backdropDismiss: false
    });
    paymentPopover.present();

    const { data: payment } = await paymentPopover.onDidDismiss();

    if(payment == null) return;

    const foundQuotaPayments = this.newPayments.find((quotaPayment: any) => {
      return quotaPayment.quota_id == quotaId;
    });

    if(foundQuotaPayments){
      foundQuotaPayments.payments.push(payment);
    } else {
      this.newPayments.push({
        quota_id: quotaId,
        payments: [payment]
      });
    }

    const foundVisitQuota = this.detail.sale.quotas.find((quota: any) => {
      return quota.id == quotaId;
    })

    foundVisitQuota.quota_payments.push(payment)

  }

  async finishVisit() {
    if(this.newPayments.length < 1){
      const commentaryPopover = await this.popoverCtrl.create({
        component: CommentaryPopoverComponent
      });
      commentaryPopover.present();

      const {data: comment, role} = await commentaryPopover.onDidDismiss();
      
      if(role == 'close' || role == 'backdrop') return;

      this.visitService.finishVisit([], this.visit.id, comment).subscribe(async (resp: any) => {
        const visitResult = {
         ...resp.result,
         created_date: moment().format('DD/MM/YYYY hh:mm'),
         color: determineColor([], this.detail.target_amount),
         payments: []
        };

        const toastCtrl = await this.toastCtrl.create({
          message: 'La visita fue completada exitosamente!',
          position: 'bottom',
          duration: 1500,
          color: 'success',
        });
        toastCtrl.present();
        this.modalCtrl.dismiss(visitResult, 'dismiss')
      });
    } else {
      const payments = this.newPayments.length > 0 ? this.newPayments.flatMap((quotaPayment: any) => quotaPayment.payments) :
                                                      null;

      const color = determineColor(payments, this.detail.target_amount);
      this.visitService.finishVisit(this.newPayments, this.visit.id).subscribe(async (resp: any) => {
        const visitResult = {
         ...resp.result,
         created_date: moment().format('DD/MM/YYYY hh:mm'),
         color: color,
         payments: payments
        };

        const toastCtrl = await this.toastCtrl.create({
          message: 'La visita fue completada exitosamente!',
          position: 'bottom',
          duration: 1500,
          color: 'success'
        });
        toastCtrl.present()
        this.modalCtrl.dismiss(visitResult, 'dismiss')
      });
    }
  }

  foundInVisitPayments(payment: any){
    if(this.detail.visit_result == null) return false;
    const foundPaymentInVisit = this.detail.visit_result.payments.find((visitPayment: any) => {
      return payment.id == visitPayment.id;
    })

    if(!foundPaymentInVisit) return false;

    return true;
  }

  back() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

}
