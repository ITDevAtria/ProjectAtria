import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from '../../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';

/**
 * Generated class for the PurchasingorderaddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-detailpoadd',
  templateUrl: 'detailpoadd.html',
})
export class DetailpoaddPage {
  myForm: FormGroup;
  private items = [];
  private purchasing_order_detail = [];
  private nextno = '';
  private nextnorcv = '';
  item: any = {};
  private itemdesc = '';
  private itemdiv = '';
  private orderno = '';
  private docno = '';
  private batchno = '';
  private locationcode = '';
  private transferdate = '';
  private poid = '';
  private uuid = '';
  private uuid2 = '';
  totalitem: any;
  totalcount: any;

  error_messages = {
    'docno': [
      { type: 'required', message: 'Doc No Must Be Fill' }

    ],
    'orderno': [
      { type: 'required', message: 'Order No Must Be Fill' }
    ],
    'itemno': [
      { type: 'required', message: 'Vendor No Must Be Fill' }
    ],
    'qty': [
      { type: 'required', message: 'Transfer Date Must Be Fill' }
    ],
    'unit': [
      { type: 'required', message: 'Location Code Must Be Fill' }
    ]
  }
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public fb: FormBuilder,
    public api: ApiProvider,
    public alertCtrl: AlertController
  ) {
    this.myForm = fb.group({
      docno: ['', Validators.compose([Validators.required])],
      orderno: ['', Validators.compose([Validators.required])],
      itemno: ['', Validators.compose([Validators.required])],
      qty: ['', Validators.compose([Validators.required])],
      unit: ['', Validators.compose([Validators.required])],
    })
    this.getItems();
    this.orderno = navParams.get('orderno');
    this.docno = navParams.get('orderno');
    this.batchno = navParams.get('batchno');
    this.locationcode = navParams.get('locationcode');
    this.transferdate = navParams.get('transferdate');
    this.totalitem = navParams.get('totalitem');
    this.poid = navParams.get('poid');
    this.totalcount = navParams.get('totalcount')
    this.myForm.get('docno').setValue(this.docno);
    this.myForm.get('orderno').setValue(this.orderno);
  }
  getItems() {
    this.api.get('table/items', { params: { limit: 100 } }).subscribe(val => {
      this.items = val['data'];
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PurchasingorderaddPage');
    console.log('Next No', this.nextno);
    console.log('Order No', this.orderno);
    console.log('Total', this.totalcount);
  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  onChange(item) {
    console.log('Testing', item);
    this.item = item;
    this.itemdesc = item.description;
    this.itemdiv = item.division_code;
  }
  insertPODetail() {
    this.getNextNo().subscribe(val => {
      this.nextno = val['nextno'];
      let uuid = UUID.UUID();
      this.uuid = uuid;
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      this.api.post("table/purchasing_order_detail",
        {
          "po_detail_no": this.nextno,
          "doc_no": this.myForm.value.docno,
          "order_no": this.myForm.value.orderno,
          "batch_no": this.batchno,
          "item_no": this.myForm.value.itemno,
          "description": this.itemdesc,
          "location_code": this.locationcode,
          "transfer_date": this.transferdate,
          "qty": this.myForm.value.qty,
          "unit": this.myForm.value.unit,
          "division": this.itemdiv,
          "status": '1',
          "chronology_no": '',
          "uuid": this.uuid
        },
        { headers })
        .subscribe(
          (val) => {
            console.log("POST call successful value returned in body",
              val);
            this.api.put("table/purchasing_order",
              {
                "po_id": this.poid,
                "total_item": this.totalcount + 1
              },
              { headers })
              .subscribe();
              console.log(
                this.nextno,
                this.myForm.value.docno,
                this.batchno,
                this.myForm.value.orderno,
                this.myForm.value.itemno,
                this.locationcode,
                this.transferdate,
                this.myForm.value.qty,
                this.myForm.value.unit,
                this.itemdiv
              )
              let uuid2 = UUID.UUID();
              this.uuid2 = uuid2;
              const headersrcv = new HttpHeaders()
              .set("Content-Type", "application/json");
              this.api.post("table/receiving",
                {
                  "receiving_no": this.nextno,
                  "doc_no": this.myForm.value.docno,
                  "order_no": this.myForm.value.orderno,
                  "batch_no": this.batchno,
                  "item_no": this.myForm.value.itemno,
                  "location_code": this.locationcode,
                  "transfer_date": this.transferdate,
                  "receiving_date": this.transferdate,
                  "qty": this.myForm.value.qty,
                  "unit": this.myForm.value.unit,
                  "division": this.itemdiv,
                  "staging": "",
                  "position": "",
                  "status": "1",
                  "receiving_pic": "",
                  "chronology_no": "",
                  "uuid": this.uuid2
                },
                { headersrcv })
                .subscribe();
            this.myForm.reset()
            let alert = this.alertCtrl.create({
              title: 'Sukses',
              subTitle: 'Insert Sukses',
              buttons: ['OK']
            });
            alert.present();
            this.viewCtrl.dismiss();
          },
          response => {
            console.log("POST call in error", response);
          },
          () => {
            console.log("The POST observable is now completed.");
          });
    });
  }
  getNextNo() {
    return this.api.get('nextno/purchasing_order_detail/po_detail_no')
  }
  getNextNoRCV() {
    return this.api.get('nextno/receiving/receiving_no')
  }
}
