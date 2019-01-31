import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CekstockPage } from './cekstock';

@NgModule({
  declarations: [
    CekstockPage,
  ],
  imports: [
    IonicPageModule.forChild(CekstockPage),
  ],
})
export class CekstockPageModule {}
