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
  myFormModalItems: FormGroup;
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
  public itemsshow: boolean = false;
  halaman = 0;
  public userid: any;
  public rolecab: any;

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
      description: ['', Validators.compose([Validators.required])],
      qty: ['', Validators.compose([Validators.required])],
      unit: ['', Validators.compose([Validators.required])],
    })
    this.myFormModalItems = fb.group({
      items: ['', Validators.compose([Validators.required])],
    })
    this.getItems();
    this.userid = navParams.get('userid')
    this.rolecab = navParams.get('rolecab')
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
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Item"} }).subscribe(val => {
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
      this.api.get("table/transfer_order_detail", { params: { filter: "to_no=" + "'" + this.tono + "' AND location_current_code=" + "'" + this.rolecab + "'", sort: 'line_no DESC' } })
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
                "description": this.myForm.value.description,
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
                "pic": this.userid,
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
                "description": this.myForm.value.description,
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
                "pic": this.userid,
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
  doOffItems() {
    this.itemsshow = false;
    document.getElementById('content').style.display = 'block'
    document.getElementById('footer').style.display = 'block'
    this.myFormModalItems.reset()
  }
  doOpenItems() {
    this.itemsshow = true;
    document.getElementById('content').style.display = 'none'
    document.getElementById('footer').style.display = 'none'
  }
  getSearch(ev: any) {
    // set val to the value of the searchbar
    let value = ev.target.value;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Item", filter: "No_ LIKE '%" + value + "%'", sort: "No_" + " ASC " } })
        .subscribe(val => {
          let data = val['data']
          this.items = data.filter(item => {
            return item.No_.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.getItems()
    }
  }
  doSelectItems(item) {
    this.myForm.get('itemno').setValue(item.No_)
    this.myForm.get('description').setValue(item.Description)
    this.myForm.get('unit').setValue(item["Base Unit of Measure"])
    this.doOffItems()
  }
}
