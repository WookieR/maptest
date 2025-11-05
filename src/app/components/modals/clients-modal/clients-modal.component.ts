import { Component, EventEmitter, Input, OnInit, output, Output } from '@angular/core';
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
  }

  pickObjectiveClient(client: any, visit: any) {
    const visited = visit.visit_result != null ? true : false;
    
    this.modalCtrl.dismiss({client, visited}, 'pick');
  }

  markAsPending(visit: any) {
    visit.pending = true;
    this.modalCtrl.dismiss(null, 'markedAsPending');
  }

}
