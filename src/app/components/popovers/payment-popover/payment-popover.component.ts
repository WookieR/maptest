import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, LoadingController, Platform, PopoverController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';

interface ErrorTexts {
  amount: string | null,
  type: string | null,
  config: string | null
}

@Component({
  selector: 'app-payment-popover',
  templateUrl: './payment-popover.component.html',
  styleUrls: ['./payment-popover.component.scss'],
  imports: [IonicModule, ReactiveFormsModule]
})
export class PaymentPopoverComponent implements OnInit, ViewWillEnter, ViewWillLeave {
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef<HTMLInputElement>;
  @Input() paymentToUpdate: any
  @Input() limitToPay: number
  @Input() simple: boolean
  paymentForm: FormGroup;
  errorTexts: ErrorTexts = {
    amount: '',
    type: '',
    config: ''
  }
  receipts: any[] = [];
  backButtonSubscription: Subscription;

  constructor(private popoverCtrl: PopoverController,
              private fb: FormBuilder,
              private imageUploadService: ImageUploadService,
              private loadingCtrl: LoadingController,
              private platform: Platform) {
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

  ngOnInit() {

    // App.addListener('backButton', () => {
    //   this.close();
    // })

    this.paymentForm = this.fb.group({
      amount: [this.paymentToUpdate ? this.paymentToUpdate.amount : null, [Validators.min(0.01), Validators.max(this.limitToPay), Validators.required], []],
      type: [this.paymentToUpdate ? this.paymentToUpdate.type :null, [Validators.required]],
      config: [this.simple ? 'Acumulacion' : null, [], []]
    });

    // this.receipts.push({
    //   url: 'https://taionner-bucket.sfo3.cdn.digitaloceanspaces.com/transfer-receipts/1764335431410.jpeg'
    // })
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

    if(this.paymentForm.value.type == 'Transferencia' && this.receipts.length < 1) return;

    if(this.paymentToUpdate) this.paymentForm.value.index = this.paymentToUpdate.index;
    const payment = {
      ...this.paymentForm.value,
      receipts: this.receipts
    }
    this.popoverCtrl.dismiss(payment, 'create');
  }

  // async onFileChange(event: Event) {
  //   const element = event.target as HTMLInputElement;
  //   const files = element.files;
  //   if (files && files.length > 0) {
  //     const loading = await this.loadingCtrl.create({
  //       backdropDismiss: false,
  //       spinner: 'crescent',
  //       message: '...Subiendo comprobante'
  //     });

  //     loading.present();
  //     // Process the selected file(s) here
  //     const file = files[0];
  //     const uploadResp: any = await this.imageUploadService.uploadImage('transfer-receipts', file);
  //     this.receipts.push({
  //       url: uploadResp.result
  //     })
  //     loading.dismiss()

  //     // You can use the File API or FileReader to get file contents
  //   }
  // }

  isTransfering(): boolean {
    const isTransfering = this.paymentForm.value.type == 'Transferencia';
    return isTransfering;
  }

  async triggerFileInput() {
    const loading = await this.loadingCtrl.create({
      backdropDismiss: false,
      spinner: 'crescent',
      message: '...Subiendo comprobante'
    });
    try{
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // or .Base64 for string without prefix
        source: CameraSource.Prompt,
        promptLabelPhoto: 'Seleccionar de la Galeria',
        promptLabelPicture: 'Tomar Foto'
      });
      loading.present();

      const file = await this.dataURLtoFile(image.dataUrl, Date.now().toString() + '.jpeg');
      const newReceipt: any = await this.imageUploadService.uploadImage('transfer-receipts', file);
      this.receipts.push({
        url: newReceipt.result
      });
      loading.dismiss();
    } catch (e){
      console.log(e);
      loading.dismiss();
    }
  }

  async dataURLtoFile(dataurl: any, filename: any) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {
      type: mime
    });
  }

  close() {
    this.popoverCtrl.dismiss(null, 'close')
  }

}
