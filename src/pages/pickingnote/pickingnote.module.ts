import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PickingnotePage } from './pickingnote';

@NgModule({
  declarations: [
    PickingnotePage,
  ],
  imports: [
    IonicPageModule.forChild(PickingnotePage),
  ],
})
export class PickingnotePageModule {}
