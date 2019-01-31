import { Component } from '@angular/core';
import { LoadingController, FabContainer, ActionSheetController, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Storage } from '@ionic/storage';

declare var window;
declare var Honeywell;

@IonicPage()
@Component({
  selector: 'page-putaway',
  templateUrl: 'putaway.html',
})
export class PutawayPage {
  myForm: FormGroup;
  myFormModal: FormGroup;
  private receiving = [];
  private location_master = [];
  private division = [];
  private putaway = [];
  private putawaylist = [];
  private putawaytemp = [];
  private receivingputawaylist = [];
  private getputawaylist = [];
  private location = [];
  private listputaway = [];
  private listputawaydetail = [];
  private putawayfound = [];
  searchrcv: any;
  searchloc: any;
  searchputaway: any;
  halaman = 0;
  totaldata: any;
  totaldataputaway: any;
  totaldataputawaydetail: any;
  totaldatalistputaway: any;
  divisioncode = '';
  divdesc = '';
  setdiv = '';
  receivingno = '';
  docno = '';
  orderno = '';
  batchno = '';
  itemno = '';
  locationcode = '';
  position = '';
  divisionno = '';
  qty = '';
  qtyprevious = '';
  putawayno = '';
  qtyreceiving = '';
  unit = '';
  rcvlist = '';
  barcodeno = '';
  rackno = '';
  sortPUT = '';
  filter = '';
  public totalqty: any;
  private nextno = '';
  public toggled: boolean = false;
  public detailput: boolean = false;
  public detailputlist: boolean = false;
  put: string = "qcin";
  public buttonText: string;
  public loading: boolean;
  option: BarcodeScannerOptions;
  data = {};
  groupby = '';
  search = '';
  itemnolist = '';
  batchnolist = '';
  locationlist = '';
  private token: any;
  public loader: any;
  public name: any;
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
    private barcodeScanner: BarcodeScanner,
    public actionSheetCtrl: ActionSheetController,
    public storage: Storage,
    public loadingCtrl: LoadingController
  ) {
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Content...'
    });
    this.loader.present();
    this.myForm = formBuilder.group({
      rackno: ['', Validators.compose([Validators.required])],
      barcodeno: [''],
    })
    this.myFormModal = formBuilder.group({
      qty: ['', Validators.compose([Validators.required])],
      location: ['', Validators.compose([Validators.required])],
    })
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.getrcv();
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" } })
      .subscribe(val => {
        this.listputaway = val['data'];
        this.totaldataputaway = val['count'];
        this.searchputaway = this.listputaway;
      });
    this.toggled = false;
    this.put = "qcin"
    this.groupby = ""
    this.search = 'item_no';
  }
  ngAfterViewInit() {
    this.loader.dismiss();
  }
  doProfile() {
    this.navCtrl.push('UseraccountPage');
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
  ionViewDidLoad() {
  }
  getrcv() {
    return new Promise(resolve => {
      let offsetinforcv = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/receiving', { params: { limit: 30, offset: offsetinforcv, filter: "status='CLSD'" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.receiving.push(data[i]);
              this.totaldata = val['count'];
              this.searchrcv = this.receiving;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    });
  }
  getputaway() {
    return new Promise(resolve => {
      let offsetputaway = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/putaway', { params: { limit: 30, offset: offsetputaway, filter: "status='OPEN'" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.listputaway.push(data[i]);
              this.totaldatalistputaway = val['count'];
              this.searchputaway = this.listputaway;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    });
  }
  getSetGroupBy(groupby) {
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'", group: groupby, groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.listputaway = val['data'];
        this.totaldataputaway = val['count'];
        this.searchputaway = this.listputaway;
      });
  }
  getDetailGroupByItems(listpu) {
    this.listputawaydetail = [];
    this.detailputlist = this.detailputlist ? false : true
    this.itemnolist = listpu.item_no
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "item_no=" + "'" + listpu.item_no + "'" } })
      .subscribe(val => {
        this.listputawaydetail = val['data'];
        this.totaldataputawaydetail = val['count'];
      });
  }
  getDetailGroupByBatchno(listpu) {
    this.listputawaydetail = [];
    this.detailputlist = this.detailputlist ? false : true
    this.batchnolist = listpu.batch_no
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "batch_no=" + "'" + listpu.batch_no + "'" } })
      .subscribe(val => {
        this.listputawaydetail = val['data'];
        this.totaldataputawaydetail = val['count'];
      });
  }
  getDetailGroupByLocation(listpu) {
    this.listputawaydetail = [];
    this.detailputlist = this.detailputlist ? false : true
    this.locationlist = listpu.location_position
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "location_position=" + "'" + listpu.location_position + "'" } })
      .subscribe(val => {
        this.listputawaydetail = val['data'];
        this.totaldataputawaydetail = val['count'];
      });
  }
  getSearchItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchbatch(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.batch_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchlocations(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.location_position.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchGroupItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchGroupbatch(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.batch_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchGrouplocations(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.location_position.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfinite(infiniteScroll) {
    this.getrcv().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }
  viewDetail(rcv) {
    this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + rcv.receiving_no } })
      .subscribe(val => {
        this.putaway = val['data'];
        this.rcvlist = rcv.receiving_no;
        this.totaldataputaway = val['count'];
        this.detailput = this.detailput ? false : true;
      });
  }

  doRefresh(refresher) {
    this.api.get('table/receiving', { params: { limit: 30, filter: "status='CLSD'" } })
      .subscribe(val => {
        this.receiving = val['data'];
        this.totaldata = val['count'];
        this.searchrcv = this.receiving;
        refresher.complete();
      });
  }
  doRefreshputaway(refresher) {
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" } })
      .subscribe(val => {
        this.listputaway = val['data'];
        this.totaldataputaway = val['count'];
        this.searchputaway = this.listputaway;
        refresher.complete();
      });
  }
  doOpenListPutaway() {
    this.myForm.reset();
    if (document.getElementById("myListPutaway").style.display == "none" && document.getElementById("myHeader").style.display == "block") {
      document.getElementById("myListPutaway").style.display = "block";
      document.getElementById("myHeader").style.display = "none";
      this.getPutawayTemp();
    }
    else if (document.getElementById("myListPutaway").style.display == "" && document.getElementById("myHeader").style.display == "") {
      document.getElementById("myListPutaway").style.display = "block";
      document.getElementById("myHeader").style.display = "none";
      this.getPutawayTemp();
    }
    else {
      document.getElementById("myListPutaway").style.display = "none";
      document.getElementById("myHeader").style.display = "block";
      this.putawaytemp = [];
    }
  }
  doOpenQty() {
    var batchno = this.myForm.value.barcodeno.substring(0, 6);
    var itemno = this.myForm.value.barcodeno.substring(6, 14);
    this.api.get('table/receiving', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "status='CLSD'" } })
      .subscribe(val => {
        this.receivingputawaylist = val['data'];
        if (this.receivingputawaylist.length != 0) {
          let alert = this.alertCtrl.create({
            title: 'Qty',
            inputs: [
              {
                name: 'qty',
                placeholder: 'Qty'
              }
            ],
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {

                }
              },
              {
                text: 'OK',
                handler: data => {
                  this.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" } })
                    .subscribe(val => {
                      this.getputawaylist = val['data'];
                      if (this.getputawaylist.length) {
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        let date = moment().format('YYYY-MM-DD');
                        this.api.put("table/putawaylist_temp",
                          {
                            "putawaylisttemp_no": this.getputawaylist[0].putawaylisttemp_no,
                            "qty": parseInt(this.getputawaylist[0].qty) + parseInt(data.qty),
                            "date": date,
                            "pic": '12345'
                          },
                          { headers })
                          .subscribe(val => {
                            this.getPutawayTemp();
                            this.myForm.get('barcodeno').setValue('')
                            let alert = this.alertCtrl.create({
                              title: 'Sukses ',
                              subTitle: 'Update Item Sukses',
                              buttons: ['OK']
                            });
                            alert.present();
                          })
                      }
                      else {
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.getNextNoPUTemp().subscribe(val => {
                          this.nextno = val['nextno'];
                          let date = moment().format('YYYY-MM-DD');
                          this.api.post("table/putawaylist_temp",
                            {
                              "putawaylisttemp_no": this.nextno,
                              "receiving_no": this.receivingputawaylist[0].receiving_no,
                              "doc_no": this.receivingputawaylist[0].doc_no,
                              "order_no": this.receivingputawaylist[0].order_no,
                              "batch_no": this.receivingputawaylist[0].batch_no,
                              "item_no": this.receivingputawaylist[0].item_no,
                              "posting_date": date,
                              "location_code": this.receivingputawaylist[0].location_code,
                              "location_position": this.receivingputawaylist[0].position,
                              "division": this.receivingputawaylist[0].division,
                              "qty": data.qty,
                              "qty_receiving": this.receivingputawaylist[0].qty_receiving,
                              "unit": this.receivingputawaylist[0].unit,
                              "flag": '',
                              "pic": '12345',
                              "status": 'OPEN',
                              "chronology_no": '',
                              "uuid": UUID.UUID()
                            },
                            { headers })
                            .subscribe(val => {
                              this.getPutawayTemp();
                              this.myForm.get('barcodeno').setValue('')
                              let alert = this.alertCtrl.create({
                                title: 'Sukses ',
                                subTitle: 'Add Item Sukses',
                                buttons: ['OK']
                              });
                              alert.present();
                            })
                        });
                      }
                    });
                }
              }
            ]
          });
          alert.present();
        }
        else {
          let alert = this.alertCtrl.create({
            title: 'Error ',
            subTitle: 'Barcode Not Found',
            buttons: ['OK']
          });
          alert.present();
        }

      });

  }
  doSavelistToPutaway() {
    this.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "pic=" + '12345' } })
      .subscribe(val => {
        this.getputawaylist = val['data'];
        this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + this.getputawaylist[0].receiving_no + " AND " + "location_position=" + "'" + this.myForm.value.rackno + "'" } })
          .subscribe(val => {
            this.putawayfound = val['data'];
            if (this.putawayfound.length == 0) {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.get('nextno/putaway/putaway_no').subscribe(val => {
                this.nextno = val['nextno'];
                let date = moment().format('YYYY-MM-DD');
                this.api.post("table/putaway",
                  {
                    "putaway_no": this.nextno,
                    "receiving_no": this.getputawaylist[0].receiving_no,
                    "doc_no": this.getputawaylist[0].doc_no,
                    "order_no": this.getputawaylist[0].order_no,
                    "batch_no": this.getputawaylist[0].batch_no,
                    "item_no": this.getputawaylist[0].item_no,
                    "posting_date": date,
                    "location_code": this.getputawaylist[0].location_code,
                    "location_position": this.myForm.value.rackno,
                    "division": this.getputawaylist[0].division,
                    "qty": this.getputawaylist[0].qty,
                    "qty_receiving": this.getputawaylist[0].qty_receiving,
                    "unit": this.getputawaylist[0].unit,
                    "flag": '',
                    "pic": '',
                    "status": 'OPEN',
                    "chronology_no": '',
                    "uuid": UUID.UUID()
                  },
                  { headers })
                  .subscribe(val => {
                    this.api.get('table/receiving', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
                      .subscribe(val => {
                        let data = val['data']
                        this.getNextNoStockBalance().subscribe(val => {
                          console.log('1', this.myFormModal)
                          this.nextnostockbalance = val['nextno'];
                          const headers = new HttpHeaders()
                            .set("Content-Type", "application/json");
                          let date = moment().format('YYYY-MM-DD');
                          this.api.post("table/stock_balance",
                            {
                              "id": this.nextnostockbalance,
                              "receiving_no": data[0].receiving_no,
                              "batch_no": data[0].batch_no,
                              "item_no": data[0].item_no,
                              "qty_in": this.myFormModal.value.qty,
                              "qty_out": 0,
                              "location": data[0].location_code,
                              "sub_location": this.myForm.value.rackno,
                              "description": 'Putaway',
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
                                  "receiving_no": data[0].receiving_no,
                                  "batch_no": data[0].batch_no,
                                  "item_no": data[0].item_no,
                                  "qty_in": this.myFormModal.value.qty,
                                  "qty_out": 0,
                                  "location": data[0].location_code,
                                  "sub_location": this.myForm.value.rackno,
                                  "description": 'Putaway',
                                  "status": 'OPEN',
                                  "datetime": date,
                                  "uuid": UUID.UUID()
                                },
                                { headers })
                                .subscribe()
                            })
                        });
                      })
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");
                    this.api.delete("table/putawaylist_temp", { params: { filter: "putawaylisttemp_no=" + "'" + this.getputawaylist[0].putawaylisttemp_no + "'" }, headers })
                      .subscribe(val => {
                        this.putawayfound = [];
                        this.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "pic=" + '12345' } })
                          .subscribe(val => {
                            this.getputawaylist = val['data'];
                            if (this.getputawaylist.length != 0) {
                              this.doSavelistToPutaway();
                            }
                            else {
                              let alert = this.alertCtrl.create({
                                title: 'Sukses ',
                                subTitle: 'Save Item To Rack Sukses',
                                buttons: ['OK']
                              });
                              this.myForm.reset()
                              alert.present();
                              this.getPutawayTemp();
                            }
                          });
                      })
                  });
              });
            }
            else {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              let date = moment().format('YYYY-MM-DD');
              this.api.put("table/putaway",
                {
                  "putaway_no": this.putawayfound[0].putaway_no,
                  "qty": parseInt(this.putawayfound[0].qty) + parseInt(this.getputawaylist[0].qty)
                },
                { headers })
                .subscribe(val => {
                  this.api.get('table/receiving', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
                    .subscribe(val => {
                      let data = val['data']
                      this.getNextNoStockBalance().subscribe(val => {
                        console.log('2', this.myFormModal)
                        this.nextnostockbalance = val['nextno'];
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        let date = moment().format('YYYY-MM-DD');
                        this.api.post("table/stock_balance",
                          {
                            "id": this.nextnostockbalance,
                            "receiving_no": data[0].receiving_no,
                            "batch_no": data[0].batch_no,
                            "item_no": data[0].item_no,
                            "qty_in": this.myFormModal.value.qty,
                            "qty_out": 0,
                            "location": data[0].location_code,
                            "sub_location": this.myFormModal.value.location,
                            "description": 'Putaway',
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
                                "receiving_no": data[0].receiving_no,
                                "batch_no": data[0].batch_no,
                                "item_no": data[0].item_no,
                                "qty_in": this.myFormModal.value.qty,
                                "qty_out": 0,
                                "location": data[0].location_code,
                                "sub_location": this.myFormModal.value.location,
                                "description": 'Putaway',
                                "status": 'OPEN',
                                "datetime": date,
                                "uuid": UUID.UUID()
                              },
                              { headers })
                              .subscribe()
                          })
                      });
                    })
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  this.api.delete("table/putawaylist_temp", { params: { filter: "putawaylisttemp_no=" + "'" + this.getputawaylist[0].putawaylisttemp_no + "'" }, headers })
                    .subscribe(val => {
                      this.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "pic=" + '12345' } })
                        .subscribe(val => {
                          this.getputawaylist = val['data'];
                          let alert = this.alertCtrl.create({
                            title: 'Sukses ',
                            subTitle: 'Save Item To Rack Sukses',
                            buttons: ['OK']
                          });
                          this.myForm.reset()
                          alert.present();
                          this.getPutawayTemp();
                        });
                    })
                });
            }
          });
      });
  }
  doSaveToPutaway() {
    this.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "pic=" + '12345' } })
      .subscribe(val => {
        this.getputawaylist = val['data'];
        this.api.get('table/location_master', { params: { filter: "location_alocation=" + "'" + this.myForm.value.rackno + "'" } })
          .subscribe(val => {
            this.location = val['data'];
            if (this.getputawaylist.length == 0) {
              let alert = this.alertCtrl.create({
                title: 'Error ',
                subTitle: 'List Putway Must Be Fill',
                buttons: ['OK']
              });
              alert.present();
            }
            else if (this.myForm.value.rackno == '') {
              let alert = this.alertCtrl.create({
                title: 'Error ',
                subTitle: 'Rack Number Must Be Fill',
                buttons: ['OK']
              });
              alert.present();
            }
            else if (this.location.length == 0) {
              let alert = this.alertCtrl.create({
                title: 'Error ',
                subTitle: 'Rack Number Not Found',
                buttons: ['OK']
              });
              alert.present();
            }
            else {
              let alert = this.alertCtrl.create({
                title: 'Confirm Save',
                message: 'Do you want to Save this list?',
                buttons: [
                  {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {

                    }
                  },
                  {
                    text: 'Save',
                    handler: () => {
                      this.doSavelistToPutaway();
                    }
                  }
                ]
              });
              alert.present();
            }
          });

      });
  }
  doPutaway(rcv) {
    this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + rcv.receiving_no } })
      .subscribe(val => {
        this.putaway = val['data'];
        this.totalqty = this.putaway.reduce(function (prev, cur) {
          return prev + cur.qty;
        }, 0);
        if (this.totalqty >= rcv.qty_receiving) {
          let alert = this.alertCtrl.create({
            title: 'Error ',
            subTitle: 'Qty does not exist',
            buttons: ['OK']
          });
          alert.present();
        }
        else {
          //this.myFormModal.reset();
          this.myFormModal.get('location').setValue('')
          document.getElementById("myModal").style.display = "block";
          this.myFormModal.get('location').setValue(rcv.location)
          this.myFormModal.get('qty').setValue(rcv.qty_receiving - this.totalqty)
          this.receivingno = rcv.receiving_no;
          this.docno = rcv.doc_no;
          this.orderno = rcv.order_no;
          this.batchno = rcv.batch_no;
          this.itemno = rcv.item_no;
          this.locationcode = rcv.location_code;
          this.position = rcv.position;
          this.divisionno = rcv.division;
          this.qty = rcv.qty;
          this.unit = rcv.unit;
        }
      });

  }
  doUpdatePutaway(put) {
    //this.myFormModal.reset();
    document.getElementById("myModal").style.display = "block";
    this.myFormModal.get('location').setValue(put.location_position)
    this.myFormModal.get('qty').setValue(put.qty_receiving)
    this.receivingno = put.receiving_no
    this.qtyprevious = put.qty
    this.putawayno = put.putaway_no
    this.qtyreceiving = put.qty_receiving
  }
  doOffPutaway() {
    //this.myFormModal.reset();
    document.getElementById("myModal").style.display = "none";
  }
  doOpenLocation() {
    this.location_master = [];
    return new Promise(resolve => {
      this.api.get('table/division', { params: { limit: 1000, sort: 'description ASC' } }).subscribe(val => {
        this.division = val['data'];
        this.divisioncode = this.division[14].description
        return new Promise(resolve => {
          this.api.get('table/location_master', { params: { limit: 1000, filter: 'division=' + "'" + this.division[14].code + "'" } }).subscribe(val => {
            this.location_master = val['data'];
            this.searchloc = this.location_master;
            document.getElementById("myLocations").style.display = "block";
            document.getElementById("myHeader").style.display = "none";
            resolve();
          })
        });
      });
    });
  }
  doOffLocations() {
    document.getElementById("myLocations").style.display = "none";
    document.getElementById("myHeader").style.display = "block";
    this.divdesc = '';
  }

  doSetLoc(div) {
    this.setdiv = div.code;
  }
  doLocation() {
    this.api.get('table/location_master', { params: { limit: 1000, filter: 'division=' + "'" + this.setdiv + "'" } }).subscribe(val => {
      this.location_master = val['data'];
      this.searchloc = this.location_master;
    });
  }
  doSelectLoc(locmst) {
    this.myFormModal.get('location').setValue(locmst.location_alocation);
    this.doOffLocations();
  }
  doInsertPutaway(data) {
    this.getNextNoStockBalance().subscribe(val => {
      let nextnostockbalance = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock_balance",
        {
          "id": nextnostockbalance,
          "receiving_no": data[0].receiving_no,
          "batch_no": data[0].batch_no,
          "item_no": data[0].item_no,
          "qty_in": this.myFormModal.value.qty,
          "qty_out": 0,
          "location": data[0].location_code,
          "sub_location": this.myFormModal.value.location,
          "description": 'Putaway',
          "status": 'OPEN',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {

        }, err => {
          this.api.post("table/stock_balance",
            {
              "id": nextnostockbalance,
              "receiving_no": data[0].receiving_no,
              "batch_no": data[0].batch_no,
              "item_no": data[0].item_no,
              "qty_in": this.myFormModal.value.qty,
              "qty_out": 0,
              "location": data[0].location_code,
              "sub_location": this.myFormModal.value.location,
              "description": 'Putaway',
              "status": 'OPEN',
              "datetime": date,
              "uuid": UUID.UUID()
            },
            { headers })
            .subscribe()
        })
    });
  }
  doSavePutaway() {
    this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
      .subscribe(val => {
        this.putaway = val['data'];
        this.totalqty = this.putaway.reduce(function (prev, cur) {
          return prev + cur.qty;
        }, 0);
        if ((parseInt(this.totalqty) + parseInt(this.myFormModal.value.qty)) > parseInt(this.qty)) {
          let alert = this.alertCtrl.create({
            title: 'Error ',
            subTitle: 'Qty does not exist',
            buttons: ['OK']
          });
          alert.present();
          this.receivingno = '';
          this.qtyprevious = '';
          this.putawayno = '';
        }
        else {
          if (this.qtyprevious == '') {
            this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + this.receivingno + " AND " + "location_position=" + "'" + this.myFormModal.value.location + "'" } })
              .subscribe(val => {
                this.putawaylist = val['data'];
                if (this.putawaylist.length != 0 && (this.putawaylist[0].location_position == this.myFormModal.value.location)) {
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  let date = moment().format('YYYY-MM-DD');
                  this.api.put("table/putaway",
                    {
                      "putaway_no": this.putawaylist[0].putaway_no,
                      "qty": parseInt(this.putawaylist[0].qty) + parseInt(this.myFormModal.value.qty)
                    },
                    { headers })
                    .subscribe(val => {
                      this.api.get('table/receiving', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
                        .subscribe(val => {
                          let data = val['data']
                          this.getNextNoStockBalance().subscribe(val => {
                            this.nextnostockbalance = val['nextno'];
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            let date = moment().format('YYYY-MM-DD');
                            this.api.post("table/stock_balance",
                              {
                                "id": this.nextnostockbalance,
                                "receiving_no": data[0].receiving_no,
                                "batch_no": data[0].batch_no,
                                "item_no": data[0].item_no,
                                "qty_in": 0,
                                "qty_out": this.myFormModal.value.qty,
                                "location": data[0].location_code,
                                "sub_location": data[0].staging,
                                "description": 'Staging In',
                                "status": 'OPEN',
                                "datetime": date,
                                "uuid": UUID.UUID()
                              },
                              { headers })
                              .subscribe(val => {
                                this.doInsertPutaway(data)
                              }, err => {
                                this.api.post("table/stock_balance",
                                  {
                                    "id": this.nextnostockbalance,
                                    "receiving_no": data[0].receiving_no,
                                    "batch_no": data[0].batch_no,
                                    "item_no": data[0].item_no,
                                    "qty_in": 0,
                                    "qty_out": this.myFormModal.value.qty,
                                    "location": data[0].location_code,
                                    "sub_location": data[0].staging,
                                    "description": 'Staging In',
                                    "status": 'OPEN',
                                    "datetime": date,
                                    "uuid": UUID.UUID()
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.doInsertPutaway(data)
                                  })
                              })
                          });
                        })
                      this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + this.receivingno } })
                        .subscribe(val => {
                          this.putaway = val['data'];
                          this.rcvlist = this.receivingno;
                          this.totaldataputaway = val['count'];
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                          this.doOffPutaway();
                          this.receivingno = '';
                          this.qtyprevious = '';
                        });
                    });
                }
                else {
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  this.getNextNo().subscribe(val => {
                    this.nextno = val['nextno'];
                    let date = moment().format('YYYY-MM-DD');
                    this.api.post("table/putaway",
                      {
                        "putaway_no": this.nextno,
                        "receiving_no": this.receivingno,
                        "doc_no": this.docno,
                        "order_no": this.orderno,
                        "batch_no": this.batchno,
                        "item_no": this.itemno,
                        "posting_date": date,
                        "location_code": this.locationcode,
                        "location_position": this.myFormModal.value.location,
                        "division": this.divisionno,
                        "qty": this.myFormModal.value.qty,
                        "qty_receiving": this.qty,
                        "unit": this.unit,
                        "flag": '',
                        "pic": '',
                        "status": 'OPEN',
                        "chronology_no": '',
                        "uuid": UUID.UUID()
                      },
                      { headers })
                      .subscribe(val => {
                        this.api.get('table/receiving', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
                          .subscribe(val => {
                            let data = val['data']
                            this.getNextNoStockBalance().subscribe(val => {
                              this.nextnostockbalance = val['nextno'];
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              let date = moment().format('YYYY-MM-DD');
                              this.api.post("table/stock_balance",
                                {
                                  "id": this.nextnostockbalance,
                                  "receiving_no": data[0].receiving_no,
                                  "batch_no": data[0].batch_no,
                                  "item_no": data[0].item_no,
                                  "qty_in": 0,
                                  "qty_out": this.myFormModal.value.qty,
                                  "location": data[0].location_code,
                                  "sub_location": data[0].staging,
                                  "description": 'Staging In',
                                  "status": 'OPEN',
                                  "datetime": date,
                                  "uuid": UUID.UUID()
                                },
                                { headers })
                                .subscribe(val => {
                                  this.doInsertPutaway(data)
                                }, err => {
                                  this.api.post("table/stock_balance",
                                    {
                                      "id": this.nextnostockbalance,
                                      "receiving_no": data[0].receiving_no,
                                      "batch_no": data[0].batch_no,
                                      "item_no": data[0].item_no,
                                      "qty_in": 0,
                                      "qty_out": this.myFormModal.value.qty,
                                      "location": data[0].location_code,
                                      "sub_location": data[0].staging,
                                      "description": 'Staging In',
                                      "status": 'OPEN',
                                      "datetime": date,
                                      "uuid": UUID.UUID()
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      this.doInsertPutaway(data)
                                    })
                                })
                            });
                          })
                        this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + this.receivingno } })
                          .subscribe(val => {
                            if ((parseInt(this.totalqty) + parseInt(this.myFormModal.value.qty)) == parseInt(this.qty)) {
                              var position = this.myFormModal.value.location.substring(0, 2);
                              this.api.put("table/receiving",
                                {
                                  "receiving_no": this.receivingno,
                                  "staging": 'RACK',
                                  "position": position
                                },
                                { headers })
                                .subscribe(val => {
                                  this.api.get('table/receiving', { params: { limit: 30, filter: "status='CLSD'" } })
                                    .subscribe(val => {
                                      this.receiving = val['data'];
                                    });
                                });
                            }
                            this.putaway = val['data'];
                            this.rcvlist = this.receivingno;
                            this.totaldataputaway = val['count'];
                            this.detailput = this.detailput ? false : true;
                            let alert = this.alertCtrl.create({
                              title: 'Sukses',
                              subTitle: 'Save Sukses',
                              buttons: ['OK']
                            });
                            alert.present();
                            this.doOffPutaway();
                            this.receivingno = '';
                            this.qtyprevious = '';
                          });
                      });
                  });
                }
              });
          }
          else {
            if (((parseInt(this.totalqty) - parseInt(this.qtyprevious)) + parseInt(this.myFormModal.value.qty)) > parseInt(this.qtyreceiving)) {
              let alert = this.alertCtrl.create({
                title: 'Error ',
                subTitle: 'Qty does not exist',
                buttons: ['OK']
              });
              alert.present();
            }
            else {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.put("table/putaway",
                {
                  "putaway_no": this.putawayno,
                  "location_position": this.myFormModal.value.location,
                  "qty": this.myFormModal.value.qty
                },
                { headers })
                .subscribe(val => {
                  this.api.get('table/receiving', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
                    .subscribe(val => {
                      let data = val['data']
                      this.getNextNoStockBalance().subscribe(val => {
                        console.log('5', this.myFormModal)
                        this.nextnostockbalance = val['nextno'];
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        let date = moment().format('YYYY-MM-DD');
                        this.api.post("table/stock_balance",
                          {
                            "id": this.nextnostockbalance,
                            "receiving_no": data[0].receiving_no,
                            "batch_no": data[0].batch_no,
                            "item_no": data[0].item_no,
                            "qty_in": this.myFormModal.value.qty,
                            "qty_out": 0,
                            "location": data[0].location_code,
                            "sub_location": this.myFormModal.value.location,
                            "description": 'Putaway',
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
                                "receiving_no": data[0].receiving_no,
                                "batch_no": data[0].batch_no,
                                "item_no": data[0].item_no,
                                "qty_in": this.myFormModal.value.qty,
                                "qty_out": 0,
                                "location": data[0].location_code,
                                "sub_location": this.myFormModal.value.location,
                                "description": 'Putaway',
                                "status": 'OPEN',
                                "datetime": date,
                                "uuid": UUID.UUID()
                              },
                              { headers })
                              .subscribe()
                          })
                      });
                    })
                  this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + this.receivingno } })
                    .subscribe(val => {
                      this.putaway = val['data'];
                      this.rcvlist = this.receivingno;
                      this.totaldataputaway = val['count'];
                      let alert = this.alertCtrl.create({
                        title: 'Sukses',
                        subTitle: 'Save Sukses',
                        buttons: ['OK']
                      });
                      alert.present();
                      this.doOffPutaway();
                      this.receivingno = '';
                      this.qtyprevious = '';
                    });
                });
            }
          }

        }
      });
  }
  doDeletePutawayList(putemp) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete  ' + putemp.item_no + ' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Delete',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");

            this.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + putemp.putawaylisttemp_no + "'" }, headers })
              .subscribe(
                (val) => {
                  this.getPutawayTemp();
                },
                response => {

                },
                () => {

                });
          }
        }
      ]
    });
    alert.present();
  }
  doScanBarcodeItem() {
    var self = this
    Honeywell.barcodeReaderPressSoftwareTrigger(function () {
      Honeywell.onBarcodeEvent(function (data) {
        var barcodeno = data.barcodeData;
        var batchno = barcodeno.substring(0, 6);
        var itemno = barcodeno.substring(6, 14);
        self.api.get('table/receiving', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "status='CLSD'" } })
          .subscribe(val => {
            self.receivingputawaylist = val['data'];
            if (self.receivingputawaylist.length) {
              let alert = self.alertCtrl.create({
                title: 'Qty',
                inputs: [
                  {
                    name: 'qty',
                    placeholder: 'Qty'
                  }
                ],
                buttons: [
                  {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: data => {

                    }
                  },
                  {
                    text: 'OK',
                    handler: data => {
                      var batchno = barcodeno.substring(0, 6);
                      var itemno = barcodeno.substring(6, 14);
                      self.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + " AND " + "item_no=" + "'" + itemno + "'" } })
                        .subscribe(val => {
                          self.getputawaylist = val['data'];
                          if (self.getputawaylist.length) {
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            let date = moment().format('YYYY-MM-DD');
                            self.api.put("table/putawaylist_temp",
                              {
                                "putawaylisttemp_no": self.getputawaylist[0].putawaylisttemp_no,
                                "qty": parseInt(self.getputawaylist[0].qty) + parseInt(data.qty),
                                "date": date,
                                "pic": '12345'
                              },
                              { headers })
                              .subscribe(val => {
                                self.getPutawayTemp();
                                self.myForm.get('barcodeno').setValue('')
                                let alert = self.alertCtrl.create({
                                  title: 'Sukses ',
                                  subTitle: 'Update Item Sukses',
                                  buttons: ['OK']
                                });
                                alert.present();
                              })
                          }
                          else {
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                              self.getNextNoPUTemp().subscribe(val => {
                                self.nextno = val['nextno'];
                              let date = moment().format('YYYY-MM-DD');
                              self.api.post("table/putawaylist_temp",
                                {
                                  "putawaylisttemp_no": self.nextno,
                                  "receiving_no": self.receivingputawaylist[0].receiving_no,
                                  "doc_no": self.receivingputawaylist[0].doc_no,
                                  "order_no": self.receivingputawaylist[0].order_no,
                                  "batch_no": self.receivingputawaylist[0].batch_no,
                                  "item_no": self.receivingputawaylist[0].item_no,
                                  "posting_date": date,
                                  "location_code": self.receivingputawaylist[0].location_code,
                                  "location_position": self.receivingputawaylist[0].position,
                                  "division": self.receivingputawaylist[0].division,
                                  "qty": data.qty,
                                  "qty_receiving": self.receivingputawaylist[0].qty_receiving,
                                  "unit": self.receivingputawaylist[0].unit,
                                  "flag": '',
                                  "pic": '12345',
                                  "status": 'OPEN',
                                  "chronology_no": '',
                                  "uuid": UUID.UUID()
                                },
                                { headers })
                                .subscribe(val => {
                                  self.getPutawayTemp();
                                  self.myForm.get('barcodeno').setValue('')
                                  let alert = self.alertCtrl.create({
                                    title: 'Sukses ',
                                    subTitle: 'Add Item Sukses',
                                    buttons: ['OK']
                                  });
                                  alert.present();
                                })
                            });
                          }
                        });
                    }
                  }
                ]
              });
              alert.present();
            }
            else {
              let alert = self.alertCtrl.create({
                title: 'Error ',
                subTitle: 'Barcode Not Found',
                buttons: ['OK']
              });
              alert.present();
            }

          });
      }, function (reason) {
        console.error(reason);
      });
    }, function (reason) {
      console.error(reason);
    }, {
        press: true
      });
  }
  doScanBarcodeRack() {
    var self = this
    Honeywell.barcodeReaderPressSoftwareTrigger(function () {
      Honeywell.onBarcodeEvent(function (data) {
        var barcodeno = data.barcodeData.substring(0, 12);
        self.myForm.get('rackno').setValue(barcodeno)
      }, function (reason) {
        console.error(reason);
      });
    }, function (reason) {
      console.error(reason);
    }, {
        press: true
      });
  }
  getPutawayTemp() {
    this.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "pic='12345'" } })
      .subscribe(val => {
        this.putawaytemp = val['data'];
      });
  }
  getNextNo() {
    return this.api.get('nextno/putaway/putaway_no')
  }
  getNextNoPUTemp() {
    return this.api.get('nextno/putawaylist_temp/putawaylisttemp_no')
  }
  doSortPUT(filter) {
    if (this.sortPUT == 'ASC') {
      this.sortPUT = 'DESC'
    }
    else {
      this.sortPUT = 'ASC'
    }
    this.api.get("table/putaway", { params: { filter: "status='OPEN'", sort: filter + " " + this.sortPUT + " " } }).subscribe(val => {
      this.listputaway = val['data'];
      this.totaldatalistputaway = val['count'];
      this.filter = filter
    });
  }
  doSortPUTDetail(filter, listpu) {

  }
  getNextNoStockBalance() {
    return this.api.get('nextno/stock_balance/id')
  }
}
