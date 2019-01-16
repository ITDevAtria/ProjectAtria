import { Component } from '@angular/core';
import { ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { UUID } from 'angular2-uuid';

@IonicPage()
@Component({
  selector: 'page-pickingdetailpart',
  templateUrl: 'pickingdetailpart.html',
})
export class PickingdetailpartPage {
  private picking_detail = [];
  searchpodetail: any;
  items = [];
  halaman = 0;
  totaldata: any;
  public toggled: boolean = false;
  receiptno = '';
  docno = ''
  batchno = '';
  locationcode = '';
  expectedreceiptdate = '';
  pickingdetail: string = "pickingdetailitem";
  private token: any;
  public detailpicking: any;
  public pickinglist: any;
  public pickingresult = [];
  public groupby = 'default'
  public nextnostockbalance: any;

  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public menu: MenuController,
    public modalCtrl: ModalController,
    public storage: Storage
  ) {
    this.toggled = false;
    this.pickingdetail = "pickingdetailitem"
    this.receiptno = navParams.get('receiptno');
    this.batchno = navParams.get('batchno');
    this.locationcode = navParams.get('locationcode');
    this.expectedreceiptdate = navParams.get('expectedreceiptdate');
    this.getSOD();
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
  getSOD() {
    this.api.get("table/picking_list_detail", { params: { filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        this.totaldata = val['count'];
      })
  }
  doRefresh(refresher) {
    this.api.get("table/picking_list_detail", { params: { filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        this.totaldata = val['count'];
        this.searchpodetail = this.picking_detail;
        refresher.complete();
      });
  }
  dodetailpicking(picking) {
    this.pickinglist = picking.item_no;
    this.detailpicking = this.detailpicking ? false : true;
    this.getPickingResult(picking);
  }
  getPickingResult(picking) {
    // this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Item", filter: "[No_]=" + "'" + picking.item_no + "'" } }).subscribe(val => {
    //   let dataitem = val['data']
    //   this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Production BOM Line", filter: "[Production BOM No_]=" + "'" + dataitem[0]["Production BOM No_"] + "'" } }).subscribe(val => {
    //     this.pickingresult = val['data']
    //   });
    // })
    this.api.get("table/picking_list_detail_part", { params: { filter: "receipt_no=" + "'" + picking.receipt_no + "' AND item_no=" + "'" + picking.item_no + "' AND status = 'OPEN'", sort: 'line_no ASC' } })
      .subscribe(val => {
        this.pickingresult = val['data']
        console.log(this.pickingresult)
      });
  }
  getSetGroupBy(groupby) {
    if (groupby == 'default') {
      this.getDetailGroupByDefault()
    }
    else if (groupby == 'item') {
      this.getDetailGroupByItems()
    }
    else if (groupby == 'part') {
      this.getDetailGroupByPart()
    }
    else if (groupby == 'location') {
      this.getDetailGroupByLocation()
    }
  }
  getDetailGroupByDefault() {
    this.api.get('table/picking_list_detail', { params: { limit: 30, filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        console.log(this.picking_detail)
        this.totaldata = val['count'];
      });
  }
  getDetailGroupByItems() {
    this.api.get('table/picking_list_detail', { params: { limit: 30, filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'", group: 'item_no', groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        console.log(this.picking_detail)
        this.totaldata = val['count'];
      });
  }
  getDetailGroupByPart() {
    this.api.get('table/picking_list_detail', { params: { limit: 30, filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'", group: 'location_code', groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        console.log(this.picking_detail)
        this.totaldata = val['count'];
      });
  }
  getDetailGroupByLocation() {
    this.api.get('table/picking_list_detail', { params: { limit: 30, filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'", group: 'location_code', groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        console.log(this.picking_detail)
        this.totaldata = val['count'];
      });
  }
  doPicking(result) {
    let alert = this.alertCtrl.create({
      title: 'Konfirmasi Pengambilan',
      message: 'Apakah item ini sudah selesai diambil?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'OK',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");
            this.api.put("table/picking_list_detail_part",
              {
                "uuid": result.uuid,
                "status": 'CLSD'
              },
              { headers })
              .subscribe(val => {
                /*this.getNextNoStockBalance().subscribe(val => {
                  this.nextnostockbalance = val['nextno'];
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  let date = moment().format('YYYY-MM-DD');
                  this.api.post("table/stock_balance",
                    {
                      "id": this.nextnostockbalance,
                      "picking_no": cek.receiving_no,
                      "batch_no": cek.batch_no,
                      "item_no": cek.item_no,
                      "qty_in": cek.qty,
                      "qty_out": 0,
                      "location": cek.location_code,
                      "sub_location": cek.staging,
                      "description": 'Receiving',
                      "status": 'OPEN',
                      "datetime": date,
                      "uuid": UUID.UUID()
                    },
                    { headers })
                    .subscribe(val => {

                    }, err => {
                      this.api.post("table/stock_balance",
                        {
                          "id": this.nextnostockbalance,
                          "picking_no": cek.receiving_no,
                          "batch_no": cek.batch_no,
                          "item_no": cek.item_no,
                          "qty_in": cek.qty,
                          "qty_out": 0,
                          "location": cek.location_code,
                          "sub_location": cek.staging,
                          "description": 'Receiving',
                          "status": 'OPEN',
                          "datetime": date,
                          "uuid": UUID.UUID()
                        },
                        { headers })
                        .subscribe()
                    })
                });*/
                this.api.get("table/picking_list_detail_part", { params: { filter: "receipt_no=" + "'" + result.receipt_no + "' AND item_no=" + "'" + result.item_no + "' AND status = 'OPEN'", sort: 'line_no ASC' } })
                  .subscribe(val => {
                    this.pickingresult = val['data']
                    if (this.pickingresult.length == 0) {
                      this.api.put("table/picking_list_detail",
                        {
                          "id": result.id,
                          "status": 'CLSD'
                        },
                        { headers })
                        .subscribe(val => {
                          this.picking_detail = [];
                          this.api.get("table/picking_list_detail", { params: { filter: "receipt_no=" + "'" + result.receiptno + "' AND status = 'OPEN'" } })
                            .subscribe(val => {
                              this.picking_detail = val['data'];
                              this.totaldata = val['count'];
                              this.api.put("table/picking_list",
                              {
                                "receipt_no": result.receipt_no,
                                "status": 'CLSD'
                              },
                              { headers })
                              .subscribe(val => {
                              });
                            })
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                        });
                    }
                    else {
                      this.picking_detail = [];
                      this.api.get("table/picking_list_detail", { params: { filter: "receipt_no=" + "'" + result.receiptno + "' AND status = 'OPEN'" } })
                        .subscribe(val => {
                          this.picking_detail = val['data'];
                          this.totaldata = val['count'];
                        })
                      let alert = this.alertCtrl.create({
                        title: 'Sukses',
                        subTitle: 'Save Sukses',
                        buttons: ['OK']
                      });
                      alert.present();
                    }
                  });
              });
          }
        }
      ]
    });
    alert.present();
  }
  getNextNoStockBalance() {
    return this.api.get('nextno/stock_balance/id')
  }
}