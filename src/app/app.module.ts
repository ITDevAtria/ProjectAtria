import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { ApiProvider } from '../providers/api/api';
import { UsertableComponent } from '../components/usertable/usertable';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { HomePage } from '../pages/home/home';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import { FileChooser } from "@ionic-native/file-chooser";
import { FileOpener } from "@ionic-native/file-opener";
import { FilePath } from "@ionic-native/file-path";
import {Camera} from '@ionic-native/camera';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    UsertableComponent
  ],
  imports: [
    BrowserModule,  
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    NgxPaginationModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    BarcodeScanner,
    FileChooser,
    FileOpener,
    FilePath,
    Camera
  ]
})
export class AppModule {
  HomePage
}
