import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from '../../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';
import { Storage } from '@ionic/storage';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-transferorderdetailadd',
  templateUrl: 'transferorderdetailadd.html',
})
export class TransferorderdetailaddPage {
  myForm: FormGroup;
  private items = [];
  private nextno = '';
  private nextnorcv = '';
  item: any = {};
  private itemdesc = '';
  private itemdiv = '';
  private tono = '';
  private from = '';
  private to = '';
  private transferdate = '';
  private uuid = '';
  private uuid2 = '';
  totalitem: any;
  totalcount: any;
  private token: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public fb: FormBuilder,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public storage: Storage
  ) {
    this.myForm = fb.group({
      tono: ['', Validators.compose([Validators.required])],
      from: ['', Validators.compose([Validators.required])],
      to: ['', Validators.compose([Validators.required])],
      transferdate: ['', Validators.compose([Validators.required])],
      itemno: ['', Validators.compose([Validators.required])],
      qty: ['', Validators.compose([Validators.required])],
      unit: ['', Validators.compose([Validators.required])],
    })
    this.getItems();
    this.tono = navParams.get('tono');
    this.from = navParams.get('from');
    this.to = navParams.get('to');
    this.transferdate = navParams.get('transferdate');
    this.myForm.get('tono').setValue(this.tono);
    this.myForm.get('from').setValue(this.from);
    this.myForm.get('to').setValue(this.to);
    this.myForm.get('transferdate').setValue(this.transferdate);
  }
  ionViewCanEnter() {
    this.storage.get('token').then((val) => {
      this.token = val;
      if (this.token != null) {
        return true;
      }
      else {
        return false;
      }
    });
  }
  getItems() {
    this.api.get('table/items', { params: { limit: 1000 } }).subscribe(val => {
      this.items = val['data'];
    });
  }

  ionViewDidLoad() {

  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  onChange(item) {
    this.item = item;
    this.itemdesc = item.description;
    this.itemdiv = item.division_code;
    console.log(item, this.itemdesc)
  }
  insertTODetail() {
    this.getNextNo().subscribe(val => {
      this.nextno = val['nextno'];
      let uuid = UUID.UUID();
      this.uuid = uuid;
      console.log(this.tono)
      this.api.get("table/transfer_order_detail", { params: { filter: "to_no=" + "'" + this.tono + "'", sort: 'line_no DESC' } })
        .subscribe(val => {
          let data = val['data']
          if (data.length != 0) {
            console.log(data)
            var lineno = parseInt(data[0].line_no) + 10000
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");
            this.api.post("table/transfer_order_detail",
              {
                "to_detail_no": this.nextno,
                "to_no": this.tono,
                "item_no": this.myForm.value.itemno,
                "description": this.itemdesc,
                "line_no": lineno,
                "division": this.itemdiv,
                "date": moment().format('YYYY-MM-DD'),
                "receipt_date": this.transferdate,
                "location_previous_code": this.from,
                "location_current_code": this.to,
                "qty": this.myForm.value.qty,
                "qty_receiving": 0,
                "unit": this.myForm.value.unit,
                "status": 'OPEN',
                "uuid": this.uuid
              },
              { headers })
              .subscribe(
                (val) => {
                  this.myForm.reset()
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Insert Detail TO Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.viewCtrl.dismiss();
                },
                response => {

                },
                () => {

                });
          }
          else {
            console.log(data)
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");
            this.api.post("table/transfer_order_detail",
              {
                "to_detail_no": this.nextno,
                "to_no": this.tono,
                "item_no": this.myForm.value.itemno,
                "description": this.itemdesc,
                "line_no": '10000',
                "division": this.itemdiv,
                "date": moment().format('YYYY-MM-DD'),
                "receipt_date": this.transferdate,
                "location_previous_code": this.from,
                "location_current_code": this.to,
                "qty": this.myForm.value.qty,
                "qty_receiving": 0,
                "unit": this.myForm.value.unit,
                "status": 'OPEN',
                "uuid": this.uuid
              },
              { headers })
              .subscribe(
                (val) => {
                  this.myForm.reset()
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Insert Detail TO Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.viewCtrl.dismiss();
                },
                response => {

                },
                () => {

                });
          }
        });
    });
  }
  getNextNo() {
    return this.api.get('nextno/transfer_order_detail/to_detail_no')
  }
}
