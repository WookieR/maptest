import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-payment-popover',
  templateUrl: './payment-popover.component.html',
  styleUrls: ['./payment-popover.component.scss'],
  imports: [IonicModule, ReactiveFormsModule]
})
export class PaymentPopoverComponent  implements OnInit {
  paymentForm: FormGroup;

  constructor(private popoverCtrl: PopoverController,
            private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.min(0.01), Validators.required], []],
      type: ['', [Validators.required]]
    });
  }

  ngOnInit() {}

  addPayment() {
    this.popoverCtrl.dismiss(this.paymentForm.value, 'create');
  }

  close() {
    this.popoverCtrl.dismiss(null, 'close')
  }

}
