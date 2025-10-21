import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-client-modal',
  templateUrl: './clients-modal.component.html',
  styleUrls: ['./clients-modal.component.scss'],
  imports: [IonicModule]
})
export class ClientsModalComponent  implements OnInit {
  @Input() visits: any;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    console.log(this.visits)
  }

  pickObjectiveClient(client: any) {
    this.modalCtrl.dismiss(client, 'pick');
  }

}
