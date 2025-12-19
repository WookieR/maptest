import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { App } from '@capacitor/app';
import { IonicModule, Platform, PopoverController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-commentary-popover',
  templateUrl: './commentary-popover.component.html',
  styleUrls: ['./commentary-popover.component.scss'],
  imports: [IonicModule, ReactiveFormsModule, FormsModule, CommonModule]
})
export class CommentaryPopoverComponent  implements OnInit, ViewWillEnter, ViewWillLeave {
  checks: any[] = [
    {
      checked: false,
      reason: "No se encontraba en la direccion"
    },
    {
      checked: false,
      reason: "No transfirio, cuando prometio hacerlo"
    },
    {
      checked: false,
      reason: "Cliente desaparecido"
    },
    {
      checked: false,
      reason: "Hoy no tocaba cobrar esta venta"
    },
        {
      checked: false,
      reason: "Me quizo agarrar a cadenazos"
    }
  ]

  enabledFreeText: boolean = false;
  freeTextCommentary: string = '';
  backButtonSubscription: Subscription;

  // commentaryForm: FormGroup;

  constructor(private fb: FormBuilder,
              private popoverCtrl: PopoverController,
              private platform: Platform) {
    // this.commentaryForm = this.fb.group({
    //   comment: ['', {}, {}]
    // })
  }

  ionViewWillEnter(): void {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(140, () => {
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
  }

  unmarkChecks(markedCheck: any){
    if(markedCheck.checked){
      this.checks.map((check: any) => {
        if(check != markedCheck){
          check.checked = false
        }

        return check
      });
    }
  }

  close(){
    return this.popoverCtrl.dismiss(null, 'close');
  }

  addCommentary() {
    let comentary = '';

    if (this.enabledFreeText) {
      comentary = this.freeTextCommentary;
    } else {
      comentary = this.checks.find((check: any) => {
        return check.checked;
      }).reason;
    }

    return this.popoverCtrl.dismiss(comentary, 'create')
  }

}
