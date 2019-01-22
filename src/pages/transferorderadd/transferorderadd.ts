import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from '../../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-transferorderadd',
  templateUrl: 'transferorderadd.html',
})
export class TransferorderaddPage {
  myForm: FormGroup;
  private location = [];
  private uuid = '';
  private token: any;
  public to = [];
  public td = [];

  // error_messages = {
  //   'docno': [
  //     { type: 'required', message: 'Doc No Must Be Fill' }

  //   ],
  //   'orderno': [
  //     { type: 'required', message: 'Order No Must Be Fill' }
  //   ],
  //   'vendorno': [
  //     { type: 'required', message: 'Vendor No Must Be Fill' }
  //   ],
  //   'transferdate': [
  //     { type: 'required', message: 'Transfer Date Must Be Fill' }
  //   ],
  //   'locationcode': [
  //     { type: 'required', message: 'Location Code Must Be Fill' }
  //   ],
  //   'description': [
  //     { type: 'required', message: 'Description Must Be Fill' }
  //   ]
  // }
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
      from: ['', Validators.compose([Validators.required])],
      to: ['', Validators.compose([Validators.required])],
      orderno: ['', Validators.compose([Validators.required])],
      transferdate: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required])],
    })
    this.doGetLocation()
  }
  doGetLocation() {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Location", sort: "[Code]" + " ASC " } })
      .subscribe(val => {
        this.location = val['data']
      });
  }
  doGetOrderNo() {
    this.api.get('table/transfer_order_request', { params: { limit: 1, filter: 'location_code=' + "'" + this.myForm.value.from + "'" } }).subscribe(val => {
      this.to = val['data'];
      if (this.to.length != 0) {
        this.myForm.get('orderno').setValue(this.to[0].code + (this.to[0].last_no_used + 1))
        this.myForm.get('description').setValue(this.to[0].description)
        console.log(this.to)
      }
      else {
        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: 'Data tidak ada',
          buttons: ['OK']
        });
        alert.present();
      }
    });
  }
  insertTO() {
    let uuid = UUID.UUID();
    this.uuid = uuid;
    let datetime = moment().format('YYYY-MM-DD HH:mm')
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.post("table/transfer_order",
      {
        "to_no": this.myForm.value.orderno,
        "from_location": this.myForm.value.from,
        "to_location": this.myForm.value.to,
        "transfer_date": this.myForm.value.transferdate,
        "description": this.myForm.value.description,
        "status": 'OPEN',
        "datetime": datetime,
        "uuid": this.uuid
      },
      { headers })
      .subscribe(
        (val) => {
          this.api.get('table/transfer_order_request', { params: { limit: 1, filter: 'location_code=' + "'" + this.myForm.value.from + "'" } }).subscribe(val => {
            this.to = val['data'];
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");
            let date = moment().format('YYYY-MM-DD')
            this.api.put("table/transfer_order_request",
              {
                "location_code": this.myForm.value.locationcode,
                "last_date_used": date,
                "last_no_used": this.to[0].last_no_used + 1
              },
              { headers })
              .subscribe((val) => {
                console.log('to sukses')
                this.myForm.reset()
              })
          });
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Insert TO Sukses',
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

}
