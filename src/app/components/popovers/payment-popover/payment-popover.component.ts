import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';

interface ErrorTexts {
  amount: string | null,
  type: string | null
}

@Component({
  selector: 'app-payment-popover',
  templateUrl: './payment-popover.component.html',
  styleUrls: ['./payment-popover.component.scss'],
  imports: [IonicModule, ReactiveFormsModule]
})
export class PaymentPopoverComponent  implements OnInit {
  @Input() paymentToUpdate: any
  @Input() limitToPay: number
  paymentForm: FormGroup;
  errorTexts: ErrorTexts = {
    amount: '',
    type: ''
  }

  constructor(private popoverCtrl: PopoverController,
            private fb: FormBuilder) {
  }

  ngOnInit() {
    this.paymentForm = this.fb.group({
      amount: [this.paymentToUpdate ? this.paymentToUpdate.amount : null, [Validators.min(0.01), Validators.max(this.limitToPay), Validators.required], []],
      type: [this.paymentToUpdate ? this.paymentToUpdate.type :null, [Validators.required]]
    });
  }

  onIonInput(event: any, control: string) {
    if(this.paymentForm.controls[control].valid) {
      this.errorTexts[control as keyof ErrorTexts] = ''
      return;
    }
    if(this.paymentForm.controls[control].hasError('required')) this.errorTexts[control as keyof ErrorTexts] = 'Es necesario especificar este campo';
    if(this.paymentForm.controls[control].hasError('max')) this.errorTexts[control as keyof ErrorTexts] = 'El maximo es ' + this.limitToPay;
    if(this.paymentForm.controls[control].hasError('min')) this.errorTexts[control as keyof ErrorTexts] = 'El minimo es 0.01';

    return;
  }

  addPayment() {
    if(this.paymentForm.invalid) return;
    if(this.paymentToUpdate) this.paymentForm.value.index = this.paymentToUpdate.index;
    this.popoverCtrl.dismiss(this.paymentForm.value, 'create');
  }

  close() {
    this.popoverCtrl.dismiss(null, 'close')
  }

}
