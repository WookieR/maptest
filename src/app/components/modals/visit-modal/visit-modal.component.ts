import { ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core';
import { IonicModule, ModalController, PopoverController, ToastController } from "@ionic/angular";
import { VisitService } from 'src/app/services/visit.service';
import { PaymentPopoverComponent } from '../../popovers/payment-popover/payment-popover.component';
import { CommentaryPopoverComponent } from '../../popovers/commentary-popover/commentary-popover.component';
import * as moment from 'moment';
import { determineColor } from 'src/app/helpers/marker-color';
import { DiscardPopoverComponent } from '../../popovers/discard-popover/discard-popover.component';
import { PaymentDeletePopoverComponent } from '../../popovers/payment-delete-popover/payment-delete-popover.component';
import { getTotalRemaining } from 'src/app/helpers/total';
import { VisitSummaryComponent } from '../../popovers/visit-summary/visit-summary.component';

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

  async openPaymentPopover(e: Event, quotaId: number, quota: any) {
    const remaining = getTotalRemaining(quota);

    const paymentPopover = await this.popoverCtrl.create({
      component: PaymentPopoverComponent,
      componentProps: {
        limitToPay: remaining
      },
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
      const index = foundQuotaPayments.payments.push(payment) - 1;
      foundQuotaPayments.payments[index].index = index;
    } else {
      payment.index = 0;
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

  private async showSuccessToast() {
    const toastCtrl = await this.toastCtrl.create({
          message: 'La visita fue completada exitosamente!',
          position: 'bottom',
          duration: 1500,
          color: 'success',
        });
    toastCtrl.present();
  }

  private buildVisitResult(payments: any, target_amount: any, resp: any) {
    const visitResult = {
      ...resp.result,
      created_date: moment().format('DD/MM/YYYY hh:mm'),
      color: determineColor(payments, target_amount),
      payments: payments
    };

    return visitResult;
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
        const visitResult = this.buildVisitResult([], this.detail.target_amount, resp)

        await this.showSuccessToast();
        
        this.modalCtrl.dismiss(visitResult, 'dismiss')
      });
    } else {
      console.log(this.detail)
      const visitSummaryPopover = await this.popoverCtrl.create({
        component: VisitSummaryComponent,
        componentProps: {
          quotas: [...this.detail.sale.quotas]
        },
        backdropDismiss: false
      });
      visitSummaryPopover.present();

      const { data: result } = await visitSummaryPopover.onDidDismiss();

      if(result != true) return;

      const payments = this.newPayments.length > 0 ? this.newPayments.flatMap((quotaPayment: any) => quotaPayment.payments) :
                                                      null;

      this.visitService.finishVisit(this.newPayments, this.visit.id).subscribe(async (resp: any) => {
        const visitResult = this.buildVisitResult(payments, this.detail.target_amount, resp)

        await this.showSuccessToast();

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

  async deletePayment(quotaIndex: number, quotaPaymentIndex: number, quotaId: number, newPaymentIndex: number) {
    const paymentDeletePopover = await this.popoverCtrl.create({
      component: PaymentDeletePopoverComponent,
    });
    paymentDeletePopover.present();

    const { data: result } = await paymentDeletePopover.onDidDismiss();

    if(result != true) return;

    this.detail.sale.quotas[quotaIndex].quota_payments.splice(quotaPaymentIndex, 1);
    const quotaPayment = this.newPayments.find((quotaPayment: any) => {
      return quotaPayment.quota_id = quotaId;
    });

    const paymentToRemoveIndex = quotaPayment.payments.findIndex((payment: any) => {
      return payment.index = newPaymentIndex;
    })
    quotaPayment.payments.splice(paymentToRemoveIndex, 1);

    const newPaymentToRemoveIndex = this.newPayments.findIndex((quotaPayment: any, index: number ) => {
      return quotaPayment.quota_id == quotaId && quotaPayment.payments.length < 1
    });

    if(newPaymentToRemoveIndex >= 0) this.newPayments.splice(newPaymentIndex, 1);
  

    return;
  }

  async modifyPayment(payment: any, quotaIdx: number, paymentIdx: number, quota: any){
    if(payment.created_date != null) return;

    const remaining = getTotalRemaining(quota, paymentIdx);

    const paymentPopover = await this.popoverCtrl.create({
      component: PaymentPopoverComponent,
      componentProps: {
        paymentToUpdate: payment,
        limitToPay: remaining
      }
    });
    paymentPopover.present();

    const { data: updatedPayment } = await paymentPopover.onDidDismiss();

    if(updatedPayment != null) this.updateNewPayments(updatedPayment, quotaIdx);

  }

  updateNewPayments(updatedPayment: any = null, quotaIdx: number) {
    this.newPayments[quotaIdx].payments[updatedPayment.index].amount = updatedPayment.amount;
    this.newPayments[quotaIdx].payments[updatedPayment.index].type = updatedPayment.type;
  }

  async back() {
    if(this.newPayments.length > 0){
      const discardPopover = await this.popoverCtrl.create({
        component: DiscardPopoverComponent
      });
      discardPopover.present();

      const { data: result } = await discardPopover.onDidDismiss();

      if(result) return this.modalCtrl.dismiss(null, 'cancel');

      return;
    } else {
      return this.modalCtrl.dismiss(null, 'cancel');
    }
      
  }

}
