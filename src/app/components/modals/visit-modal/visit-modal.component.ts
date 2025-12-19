import { ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core';
import { IonicModule, LoadingController, ModalController, Platform, PopoverController, ToastController, ViewWillEnter, ViewWillLeave } from "@ionic/angular";
import { VisitService } from 'src/app/services/visit.service';
import { PaymentPopoverComponent } from '../../popovers/payment-popover/payment-popover.component';
import { CommentaryPopoverComponent } from '../../popovers/commentary-popover/commentary-popover.component';
import * as moment from 'moment';
import { determineColor } from 'src/app/helpers/marker-color';
import { DiscardPopoverComponent } from '../../popovers/discard-popover/discard-popover.component';
import { PaymentDeletePopoverComponent } from '../../popovers/payment-delete-popover/payment-delete-popover.component';
import { getTotalRemaining } from 'src/app/helpers/total';
import { VisitSummaryComponent } from '../../popovers/visit-summary/visit-summary.component';
import { LocalstorageService } from 'src/app/stores/localstorage.service';
import { Router } from '@angular/router';
import { isToday, startOfDay, format, isSameDay } from 'date-fns';
import { OfflinePayService } from 'src/app/services/offline-pay.service';
import { buildVisitResult } from 'src/app/helpers/visit-result';
import { syncQuotas } from 'src/app/helpers/quotas-sync';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-visit-modal',
  templateUrl: './visit-modal.component.html',
  styleUrls: ['./visit-modal.component.scss'],
  imports: [IonicModule],
})
export class VisitModalComponent  implements OnInit, ViewWillEnter, ViewWillLeave {
  @Input() client: any;
  newPayments: any = [];
  newSimplePayments: any = [];
  isLoading: boolean;
  detail: any;
  status: string;
  loadingThing: any;
  @Input() saleIndex: number;
  todayDate: any =  format(startOfDay(new Date()), 'dd-MM-yyyy');
  backButtonSubscription: Subscription;
  

  constructor(private modalCtrl: ModalController,
              private popoverCtrl: PopoverController,
              private visitService: VisitService,
              private offlinePay: OfflinePayService,
              private toastCtrl: ToastController,
              private localStorageService: LocalstorageService,
              private router: Router,
              private loadingCtrl: LoadingController,
              private platform: Platform
  ) {
  }

  ionViewWillEnter(): void {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(120, () => {
      this.back();
    });
  }
  
  ionViewWillLeave(): void {
    if(this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe()
    }
  }

  async ngOnInit() {
    this.loadingThing = await this.loadingCtrl.create({
      spinner: 'crescent',
      backdropDismiss: false,
      message: '...Finalizando Visita'
    });

    this.newSimplePayments = this.client.sales[this.saleIndex].newPayments != null ? this.client.sales[this.saleIndex].newPayments : []

  }

  getSaleRemaining() {
    const total = parseFloat(this.client.sales[this.saleIndex].total);



    const totalPaidFromSimplePayments = this.newSimplePayments.reduce((accu: any, current: any) => accu += parseFloat(current.amount), 0.0);
    // // const totalFromNewQuotaPayments = this.newPayments.flatMap((newQuotaPayment: any) => newQuotaPayment.payments)
    // //                                                   .reduce((accu: any, current: any) => accu += parseFloat(current.amount), 0.0);

    const totalFromQuotaPayments = this.client.sales[this.saleIndex].quotas.flatMap((quota: any) => quota.quota_payments)
                                                          .reduce((accu: any, current: any) => accu += parseFloat(current.amount), 0.0);
    const remaining = total - (totalPaidFromSimplePayments + totalFromQuotaPayments);

    // console.log(totalFromQuotaPayments);

    return remaining;
  }

  async openSimplePaymentPopover() {
    const remaining = this.getSaleRemaining()

    const paymentPopover = await this.popoverCtrl.create({
      component: PaymentPopoverComponent,
      componentProps: {
        limitToPay: remaining,
        simple: true
      },
      backdropDismiss: false
    });
    paymentPopover.present();

    const { data: payment } = await paymentPopover.onDidDismiss();

    if(payment == null) return;

    this.newSimplePayments.push(payment);
    this.client.sales[this.saleIndex].newPayments = this.newSimplePayments;
    // syncQuotas(payment, this.client.sales[this.saleIndex].quotas);
  }

  

  // async openPaymentPopover(e: Event, quotaId: number, quota: any) {
  //   const remaining = getTotalRemaining(quota);

  //   const paymentPopover = await this.popoverCtrl.create({
  //     component: PaymentPopoverComponent,
  //     componentProps: {
  //       limitToPay: remaining,
  //       simple: false
  //     },
  //     // event: e,
  //     backdropDismiss: false
  //   });
  //   paymentPopover.present();

  //   const { data: payment } = await paymentPopover.onDidDismiss();

  //   if(payment == null) return;

  //   const foundQuotaPayments = this.newPayments.find((quotaPayment: any) => {
  //     return quotaPayment.quota_id == quotaId;
  //   });

  //   if(foundQuotaPayments){
  //     const index = foundQuotaPayments.payments.push(payment) - 1;
  //     foundQuotaPayments.payments[index].index = index;
  //   } else {
  //     payment.index = 0;
  //     this.newPayments.push({
  //       quota_id: quotaId,
  //       payments: [payment]
  //     });
  //   }

  //   const foundVisitQuota = this.detail.sale.quotas.find((quota: any) => {
  //     return quota.id == quotaId;
  //   })

  //   foundVisitQuota.quota_payments.push(payment)

  // }

  // private async showSuccessToast() {
  //   const toastCtrl = await this.toastCtrl.create({
  //         message: 'La visita fue completada exitosamente!',
  //         position: 'bottom',
  //         duration: 1500,
  //         color: 'success',
  //       });
  //   toastCtrl.present();
  // }

  async finishVisit() {
    
      const visitSummaryPopover = await this.popoverCtrl.create({
        component: VisitSummaryComponent,
        componentProps: {
          payments: this.newSimplePayments
        },
        backdropDismiss: false
      });
      visitSummaryPopover.present();

      const { data: result, role } = await visitSummaryPopover.onDidDismiss();

      if(result != true) return;

      let commentary = null;

      if(this.newSimplePayments.length < 1){
        const commentaryPopover = await this.popoverCtrl.create({
          component: CommentaryPopoverComponent
        });
        commentaryPopover.present();

        const {data: comment, role} = await commentaryPopover.onDidDismiss();

        console.log(comment);
        
        if(role == 'close' || role == 'backdrop') return;

        commentary = comment;
      }

      const visitResult = buildVisitResult([],
                                          this.newSimplePayments,
                                          parseFloat(this.client.sales[this.saleIndex].visit.target_amount),
                                          this.client.sales[this.saleIndex].visit.id);

      visitResult.commentary = commentary

      this.client.sales[this.saleIndex].visit.visit_result = visitResult;

      // //AGREGAR PAGOS A LA COLA OFFLINE, COMENTAR ESTO PARA PROBAR FLOW OFFLINE SIN PAGAR FISICAMENTE
      await this.offlinePay.addPayment({
        newPayments: [],
        newSimplePayments: this.newSimplePayments,
        visitId: this.client.sales[this.saleIndex].visit.id,
        comment: commentary,
        token: this.localStorageService.token
      })
      // //AGREGAR PAGOS A LA COLA OFFLINE, COMENTAR ESTO PARA PROBAR FLOW OFFLINE SIN PAGAR FISICAMENTE
      // syncQuotas(payment, this.client.sales[this.saleIndex].quotas);
      
      this.newSimplePayments.forEach((payment: any) => {
        syncQuotas(payment, this.client.sales[this.saleIndex].quotas);
      });
      this.modalCtrl.dismiss(visitResult, 'dismiss');
  }

  // foundInVisitPayments(payment: any){
  //   if(this.detail.visit_result == null) return false;
  //   const foundPaymentInVisit = this.detail.visit_result.payments.find((visitPayment: any) => {
  //     return payment.id == visitPayment.id;
  //   })

  //   if(!foundPaymentInVisit) return false;

  //   return true;
  // }

  // async deletePayment(quotaIndex: number, quotaPaymentIndex: number, quotaId: number, newPaymentIndex: number) {
  //   const paymentDeletePopover = await this.popoverCtrl.create({
  //     component: PaymentDeletePopoverComponent,
  //   });
  //   paymentDeletePopover.present();

  //   const { data: result } = await paymentDeletePopover.onDidDismiss();

  //   if(result != true) return;

  //   this.detail.sale.quotas[quotaIndex].quota_payments.splice(quotaPaymentIndex, 1);
  //   const quotaPayment = this.newPayments.find((quotaPayment: any) => {
  //     return quotaPayment.quota_id = quotaId;
  //   });

  //   const paymentToRemoveIndex = quotaPayment.payments.findIndex((payment: any) => {
  //     return payment.index = newPaymentIndex;
  //   })
  //   quotaPayment.payments.splice(paymentToRemoveIndex, 1);

  //   const newPaymentToRemoveIndex = this.newPayments.findIndex((quotaPayment: any, index: number ) => {
  //     return quotaPayment.quota_id == quotaId && quotaPayment.payments.length < 1
  //   });

  //   if(newPaymentToRemoveIndex >= 0) this.newPayments.splice(newPaymentIndex, 1);
  

  //   return;
  // }

  // async modifyPayment(payment: any, quotaIdx: number, paymentIdx: number, quota: any){
  //   if(payment.created_date != null) return;

  //   const remaining = getTotalRemaining(quota, paymentIdx);

  //   const paymentPopover = await this.popoverCtrl.create({
  //     component: PaymentPopoverComponent,
  //     componentProps: {
  //       paymentToUpdate: payment,
  //       limitToPay: remaining
  //     }
  //   });
  //   paymentPopover.present();

  //   const { data: updatedPayment } = await paymentPopover.onDidDismiss();

  //   if(updatedPayment != null) this.updateNewPayments(updatedPayment, quotaIdx);

  // }

  // updateNewPayments(updatedPayment: any = null, quotaIdx: number) {
  //   this.newPayments[quotaIdx].payments[updatedPayment.index].amount = updatedPayment.amount;
  //   this.newPayments[quotaIdx].payments[updatedPayment.index].type = updatedPayment.type;
  // }

  isToday(quota: any): boolean{
    if(quota.created_date == this.todayDate) {
      return true;
    }

    return false;
  }

  deleteSimplePayment(index: any){
    this.newSimplePayments.splice(index, 1);
  }

  async back() {
    if(this.newSimplePayments.length > 0 && this.client.sales[this.saleIndex].visit.visit_result == null){
      const discardPopover = await this.popoverCtrl.create({
        component: DiscardPopoverComponent
      });
      discardPopover.present();

      const { data: result } = await discardPopover.onDidDismiss();

      if(result) {
        this.newSimplePayments.length = 0;
        
        return this.modalCtrl.dismiss(null, 'cancel')

      };

      return;
    } else {
      return this.modalCtrl.dismiss(null, 'cancel');
    }
  }

}
