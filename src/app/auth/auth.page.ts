import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LocalstorageService } from '../stores/localstorage.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private localStorageService: LocalstorageService,
              private router: Router,
              private loadingCtrl: LoadingController) {
    this.loginForm = fb.group({
      dni: ['', [], []]
    });
  }

  async ngOnInit() {
    await this.localStorageService.clearStorage(); 
  }

  async submit() {
    const loading = await this.loadingCtrl.create({
      backdropDismiss: false,
      spinner: 'crescent',
      message: '...Obteniendo datos'
    });

    loading.present();
    try{
      const { dni } = this.loginForm.value;
      const resp: any = await this.authService.login(dni);
  
      await this.localStorageService.setToken(resp.result.token);
      loading.dismiss()

      this.router.navigate(['']);
    } catch (e) {
      loading.dismiss()
      console.log('falla el login culiau')
    }

  }

}
