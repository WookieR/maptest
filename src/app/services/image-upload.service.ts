import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private BASE_URL = environment.base_url;

  constructor(private http: HttpClient){

  }

  async uploadImage(type: 'transfer-receipts' | 'transfer-receipts', file: any){
    const formData: FormData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    const observable = this.http.post(this.BASE_URL + '/upload', formData).pipe(take(1));
    return await firstValueFrom(observable)
  }
}
