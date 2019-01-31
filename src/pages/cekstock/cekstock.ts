import { Component, trigger } from '@angular/core';
import { LoadingController, FabContainer, ActionSheetController, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-cekstock',
  templateUrl: 'cekstock.html',
})
export class CekstockPage {

  public stockall = [];
  public stockplus = [];
  public stockmin = [];

  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public menu: MenuController,
    public modalCtrl: ModalController,
    private barcodeScanner: BarcodeScanner,
    public actionSheetCtrl: ActionSheetController,
    public storage: Storage,
    public loadingCtrl: LoadingController) {
  }

  getSearch(ev: any) {
    // set val to the value of the searchbar
    let value = ev.target.value;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get('table/stock_balance', { params: { limit: 100,  group: 'item_no' } })
      .subscribe(val => {
        let groupitem = val['data']
        console.log(groupitem)
      });
      this.api.get('table/stock_balance', { params: { limit: 100,  group: 'batch_no' } })
      .subscribe(val => {
        let groupbatch = val['data']
        console.log(groupbatch)
      });
      this.api.get('table/stock_balance', { params: { limit: 100,  group: 'sub_location' } })
      .subscribe(val => {
        let grouplocation = val['data']
        console.log(grouplocation)
      });
      this.api.get('table/stock_balance', { params: { limit: 100,  group: 'item_no' } })
      .subscribe(val => {
        let groupitem = val['data']
        console.log(groupitem)
      });
      this.api.get('table/stock_balance', { params: { limit: 100, filter: "item_no=" + "'" + value + "' AND qty_in !=0" } })
        .subscribe(val => {
          this.stockplus = val['data']
          var dataplus = 0;
          for (let i = 0; i < this.stockplus.length; i++) {
            console.log(this.stockplus[i])
          }
        });
    }
    else {
      this.stockall = [];
    }
  }
}
