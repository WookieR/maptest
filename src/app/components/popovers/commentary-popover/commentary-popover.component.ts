import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-commentary-popover',
  templateUrl: './commentary-popover.component.html',
  styleUrls: ['./commentary-popover.component.scss'],
  imports: [IonicModule, ReactiveFormsModule, FormsModule, CommonModule]
})
export class CommentaryPopoverComponent  implements OnInit {
  checks: any[] = [
    {
      checked: false,
      reason: "El vago no estaba"
    },
    {
      checked: false,
      reason: "Se rehusa a pagar"
    },
    {
      checked: false,
      reason: "Desconoce la deuda"
    },
    {
      checked: false,
      reason: "Me apunto con un arma"
    }
  ]

  enabledFreeText: boolean = false;
  freeTextCommentary: string = '';

  // commentaryForm: FormGroup;

  constructor(private fb: FormBuilder,
              private popoverCtrl: PopoverController) {
    // this.commentaryForm = this.fb.group({
    //   comment: ['', {}, {}]
    // })
  }

  ngOnInit() {}

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
