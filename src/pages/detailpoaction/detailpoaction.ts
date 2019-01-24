import { Component } from '@angular/core';
import { ActionSheetController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Storage } from '@ionic/storage';
import { UUID } from 'angular2-uuid';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-detailpoaction',
  templateUrl: 'detailpoaction.html',
})
export class DetailpoactionPage {
  myFormModal: FormGroup;
  private purchasing_order = [];
  private purchasing_order_detail = [];
  private users = [];
  private locations = [];
  private location_master = [];
  private division = [];
  private tokennotification = [];
  searchpodetail: any;
  searchloc: any;
  poid = '';
  items = [];
  halaman = 0;
  totaldata: any;
  totaldatalocation: any;
  public toggled: boolean = false;
  code = '';
  orderno = '';
  batchno = '';
  locationcode = '';
  expectedreceiptdate = '';
  receivingno = '';
  status = '';
  totalpost = '';
  batch = '';
  item = '';
  position = '';
  qty = '';
  divisioncode = '';
  setdiv = '';
  divdesc = '';
  detailpo: string = "detailpoitem";
  barcode: {};
  private width: number;
  private height: number;
  private token: any;
  private userid = '';
  private usertoken = [];
  private userpic = '';
  private pic = '';
  private piclokasi = '';
  private picbarcode = '';
  private podlocation = [];
  private podbarcode = [];
  private pod = [];
  private nextno: any;
  private uuid = '';
  private podetail = [];
  public rolecab = '';

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
    private platform: Platform,
    public actionSheetCtrl: ActionSheetController,
    private http: HttpClient,
    public storage: Storage
  ) {
    platform.ready().then(() => {
      this.width = platform.width();
      this.height = platform.height();
    });
    this.myFormModal = formBuilder.group({
      location: ['', Validators.compose([Validators.required])],
    })
    this.toggled = false;
    this.detailpo = "detailpoitem";
    this.orderno = navParams.get('orderno');
    this.batchno = navParams.get('batchno');
    this.status = navParams.get('status');
    this.totalpost = navParams.get('totalpost')
    this.locationcode = navParams.get('locationcode');
    this.pic = navParams.get('pic');
    this.piclokasi = navParams.get('piclokasi');
    this.picbarcode = navParams.get('picbarcode');
    this.rolecab = navParams.get('rolecab');
    console.log(this.piclokasi)
    console.log(this.picbarcode)
    this.expectedreceiptdate = navParams.get('expectedreceiptdate');
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.getPOD();
    });
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
  getPOD() {
    console.log(this.orderno)
    this.api.get("table/purchasing_order_detail", { params: { filter: 'order_no=' + "'" + this.orderno + "'" + " AND status='OPEN'" } }).subscribe(val => {
      this.purchasing_order_detail = val['data'];
      this.totaldata = val['count'];
    })
  }
  getPODetail() {
    return new Promise(resolve => {
      let offset = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/purchasing_order_detail', { params: { limit: 30, offset: offset, filter: 'order_no=' + "'" + this.orderno + "'" + " AND status='OPEN'" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.purchasing_order_detail.push(data[i]);
              this.totaldata = val['count'];
              this.searchpodetail = this.purchasing_order_detail;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchPODetail(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.purchasing_order_detail = this.searchpodetail.filter(detailpo => {
        return detailpo.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.purchasing_order_detail = this.searchpodetail;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfinite(infiniteScroll) {
    this.getPODetail().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }

  doRefresh(refresher) {
    this.api.get("table/purchasing_order_detail", { params: { filter: 'order_no=' + "'" + this.orderno + "'" + " AND status='OPEN'" } }).subscribe(val => {
      this.purchasing_order_detail = val['data'];
      this.totaldata = val['count'];
      refresher.complete();
    });
  }
  doActionPO(detailpo) {
    let locationModal = this.modalCtrl.create('DetailpoactionupdatePage',
      {
        detailno: detailpo.receiving_no,
        docno: detailpo.doc_no,
        orderno: detailpo.order_no,
        itemno: detailpo.item_no,
        qty: detailpo.qty,
        receivingpic: detailpo.receiving_pic,
        locationplan: detailpo.location,
        status: detailpo.status
      },
      { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  ionViewDidLoad() {
    this.getPODetail();
  }

  doListBarcode(detailpo) {
    let locationModal = this.modalCtrl.create('BarcodelistPage', {
      batchno: detailpo.batch_no,
      orderno: detailpo.order_no,
      itemno: detailpo.item_no,
      qty: detailpo.qty
    },
      { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  doOpenToTL(detailpo) {
    this.batch = detailpo.batch_no;
    this.item = detailpo.item_no;
    this.position = detailpo.location;
    this.qty = detailpo.qty;
    this.getLocations(detailpo).subscribe(val => {
      this.locations = val['data'];
      console.log(this.locations)
      if (detailpo.location == '' && this.status == 'INP2' && this.locations.length) {
        this.myFormModal.get('location').setValue(this.locations[0].location_alocation);
        document.getElementById("myModal").style.display = "block";
        this.receivingno = detailpo.code;
      }
      else {
        this.myFormModal.get('location').setValue(detailpo.location);
        document.getElementById("myModal").style.display = "block";
        this.receivingno = detailpo.code;
      }
    });
  }
  getLocations(detailpo) {
    console.log(detailpo.location_code, detailpo.division)
    return this.api.get('table/location_master', {
      params: {
        filter:
          'location_code=' + "'" + detailpo.location_code + "'" +
          ' ' + 'AND' + ' ' +
          'division=' + "'" + detailpo.division + "'" +
          ' ' + 'AND' + ' ' +
          "status='TRUE'"
      }
    })
  }
  doOffToTL() {
    document.getElementById("myModal").style.display = "none";
    this.myFormModal.reset()
  }
  getUsers() {
    this.api.get('table/user', { params: { limit: 100 } }).subscribe(val => {
      this.users = val['data'];
    });
  }
  doSendToTL() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    console.log(this.receivingno)
    this.api.put("table/purchasing_order_detail",
      {
        "code": this.receivingno,
        "location": this.myFormModal.value.location
      },
      { headers })
      .subscribe(
        (val) => {
          document.getElementById("myModal").style.display = "none";
          const headers = new HttpHeaders()
            .set("Content-Type", "application/json");
          /*if (this.myFormModal.value.location != '') {
            this.api.put("table/location_master",
              {
                "location_alocation": this.myFormModal.value.location,
                "batch_no": this.batch,
                "item_no": this.item,
                "qty": this.qty,
                "status": 'BOOKING'
              },
              { headers })
              .subscribe();
          }
          if (this.position != '') {
            this.api.put("table/location_master",
              {
                "location_alocation": this.position,
                "batch_no": '',
                "item_no": '',
                "qty": 0,
                "status": 'TRUE'
              },
              { headers })
              .subscribe();
          }*/
          this.myFormModal.reset()
          this.locations = [];
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Save Sukses',
            buttons: ['OK']
          });
          alert.present();
          this.getPOD();
        },
        response => {
        },
        () => {
        });
  }
  doOpenLocation() {
    this.location_master = [];
    return new Promise(resolve => {
      this.api.get('table/division', { params: { limit: 1000, sort: 'description ASC' } }).subscribe(val => {
        this.division = val['data'];
        this.divisioncode = this.division[0].description
        return new Promise(resolve => {
          this.api.get('table/location_master', { params: { limit: 1000, filter: 'division=' + "'" + this.division[0].code + "' AND location_code=" + "'" + this.rolecab + "'" } }).subscribe(val => {
            this.location_master = val['data'];
            this.searchloc = this.location_master
            document.getElementById("myLocations").style.display = "block";
            //document.getElementById("myHeader").style.display = "none";
            resolve();
          })
        });
      });
    });
  }
  doSetLoc(div) {
    this.setdiv = div.code;
  }
  doLocation() {
    this.api.get('table/location_master', { params: { limit: 1000, filter: 'division=' + "'" + this.setdiv + "' AND location_code=" + "'" + this.rolecab + "'" } }).subscribe(val => {
      this.location_master = val['data'];
      this.searchloc = this.location_master
    });
  }
  doOffLocations() {
    document.getElementById("myLocations").style.display = "none";
    //document.getElementById("myHeader").style.display = "block";
    this.divdesc = '';
  }
  doSelectLoc(locmst) {
    this.myFormModal.get('location').setValue(locmst.location_alocation);
    this.doOffLocations();
  }
  getSearchLoc(ev) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.location_master = this.searchloc.filter(detailloc => {
        return detailloc.location_alocation.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.location_master = this.searchloc;
    }
  }
  /*doPostingRCV(detailpo) {
    return new Promise(resolve => {
      this.api.get("table/purchasing_order", { params: { filter: 'po_id=' + "'" + this.poid + "'" } }).subscribe(val => {
        let data = val['data'];
        for (let i = 0; i < data.length; i++) {
          this.purchasing_order.push(data[i]);
        }
        let alert = this.alertCtrl.create({
          title: 'Confirm Posting',
          message: 'Do you want to posting Item No ' + detailpo.item_no + ' ?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
              }
            },
            {
              text: 'Posting',
              handler: () => {
                const headers = new HttpHeaders()
                  .set("Content-Type", "application/json");
                if ((this.purchasing_order[0].total_item - this.purchasing_order[0].total_item_post) == 1) {
                  this.api.put("table/purchasing_order",
                    {
                      "po_id": this.poid,
                      "status": 'INPG'
                    },
                    { headers })
                    .subscribe();
                }
                this.api.put("table/purchasing_order",
                  {
                    "po_id": this.poid,
                    "total_item_post": ((this.purchasing_order[0]).total_item_post) + 1
                  },
                  { headers })
                  .subscribe();
                this.api.put("table/receiving",
                  {
                    "receiving_no": detailpo.receiving_no,
                    "status": 'INPG'
                  },
                  { headers })
                  .subscribe(
                    (val) => {
                      let alert = this.alertCtrl.create({
                        title: 'Sukses',
                        subTitle: 'Posting Sukses',
                        buttons: ['OK']
                      });
                      alert.present();
                      this.purchasing_order = [];
                      this.api.get("table/purchasing_order_detail", { params: { limit: 30, filter: 'order_no=' + "'" + this.orderno + "'" + " AND status='OPEN'" } }).subscribe(val => {
                        this.purchasing_order_detail = val['data'];
                        this.totaldata = val['count'];
                        this.searchpodetail = this.purchasing_order_detail;
                      });

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
        resolve();
      });
    });
  }*/
  doPostingRCV(detailpo) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting Item No ' + detailpo.item_no + ' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Posting',
          handler: () => {
            if (this.userid == this.piclokasi && detailpo.status_location == '') {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.put("table/purchasing_order_detail",
                {
                  "code": detailpo.code,
                  "status_location": 'OK',
                  "pic_location": this.userid
                },
                { headers })
                .subscribe(val => {
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Save Lokasi Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.api.get("table/purchasing_order_detail", { params: { filter: 'order_no=' + "'" + detailpo.order_no + "'" + " AND code=" + "'" + detailpo.code + "'" } }).subscribe(val => {
                    this.podetail = val['data'];
                    if (this.podetail[0].status_location == 'OK' && this.podetail[0].status_barcode == 'OK') {
                      this.getNextNoRCV().subscribe(val => {
                        this.nextno = val['nextno'];
                        let uuid = UUID.UUID();
                        this.uuid = uuid;
                        let date = moment().format();
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.api.post("table/receiving",
                          {
                            "receiving_no": this.nextno,
                            "order_no": detailpo.order_no,
                            "line_no": detailpo.line_no,
                            "batch_no": detailpo.batch_no,
                            "item_no": detailpo.item_no,
                            "location_code": '81003',
                            "expected_receipt_date": detailpo.expected_receipt_date,
                            "description": detailpo.description,
                            "unit": detailpo.unit,
                            "qty": detailpo.qty,
                            "qty_receiving": 0,
                            "vendor_no": detailpo.vendor_no,
                            "vendor_status": detailpo.vendor_status,
                            "division": detailpo.division,
                            "item_category_code": detailpo.item_category_code,
                            "product_group_code": detailpo.product_group_code,
                            "location": detailpo.location,
                            "status": 'OPEN',
                            "status_location": 'OK',
                            "status_barcode": detailpo.status_barcode,
                            "pic_location": this.userid,
                            "pic_barcode": detailpo.pic_barcode,
                            "date": date,
                            "uuid": this.uuid
                          },
                          { headers })
                          .subscribe()
                      });
                    }
                  });
                  this.api.get("table/purchasing_order_detail", { params: { filter: 'order_no=' + "'" + this.orderno + "'" + " AND status_location=''" } }).subscribe(val => {
                    this.podlocation = val['data'];
                    if (this.podlocation.length == 0) {
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/purchasing_order",
                        {
                          "order_no": detailpo.order_no,
                          "status_location": 'OK'
                        },
                        { headers })
                        .subscribe(val => {
                        });
                    }
                    this.api.get("table/purchasing_order", { params: { filter: 'order_no=' + "'" + this.orderno + "'" } }).subscribe(val => {
                      this.pod = val['data'];
                      if (this.podlocation.length == 0 && this.pod[0].status_barcode == 'OK') {
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.api.put("table/purchasing_order",
                          {
                            "order_no": detailpo.order_no,
                            "status": 'INPG'
                          },
                          { headers })
                          .subscribe(val => {
                          });
                      }
                    });
                  })
                  this.getPOD();
                });
            }
            else if (this.userid == this.picbarcode && detailpo.status_barcode == '') {
              console.log('barcode')
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.put("table/purchasing_order_detail",
                {
                  "code": detailpo.code,
                  "status_barcode": 'OK',
                  "pic_barcode": this.userid
                },
                { headers })
                .subscribe(val => {
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Save Barcode Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.api.get("table/purchasing_order_detail", { params: { filter: 'order_no=' + "'" + detailpo.order_no + "'" + " AND code=" + "'" + detailpo.code + "'" } }).subscribe(val => {
                    this.podetail = val['data'];
                    if (this.podetail[0].status_location == 'OK' && this.podetail[0].status_barcode == 'OK') {
                      this.getNextNoRCV().subscribe(val => {
                        this.nextno = val['nextno'];
                        let uuid = UUID.UUID();
                        this.uuid = uuid;
                        let date = moment().format();
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.api.post("table/receiving",
                          {
                            "receiving_no": this.nextno,
                            "order_no": detailpo.order_no,
                            "line_no": detailpo.line_no,
                            "batch_no": detailpo.batch_no,
                            "item_no": detailpo.item_no,
                            "location_code": detailpo.location_code,
                            "expected_receipt_date": detailpo.expected_receipt_date,
                            "description": detailpo.description,
                            "unit": detailpo.unit,
                            "qty": detailpo.qty,
                            "qty_receiving": 0,
                            "vendor_no": detailpo.vendor_no,
                            "vendor_status": detailpo.vendor_status,
                            "division": detailpo.division,
                            "item_category_code": detailpo.item_category_code,
                            "product_group_code": detailpo.product_group_code,
                            "location": detailpo.location,
                            "status": 'OPEN',
                            "status_location": detailpo.status_location,
                            "status_barcode": 'OK',
                            "pic_location": detailpo.pic_location,
                            "pic_barcode": this.userid,
                            "date": date,
                            "uuid": this.uuid
                          },
                          { headers })
                          .subscribe()
                      });
                    }
                  });
                  this.api.get("table/purchasing_order_detail", { params: { filter: 'order_no=' + "'" + this.orderno + "'" + " AND status_barcode=''" } }).subscribe(val => {
                    this.podbarcode = val['data'];
                    if (this.podbarcode.length == 0) {
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/purchasing_order",
                        {
                          "order_no": detailpo.order_no,
                          "status_barcode": 'OK'
                        },
                        { headers })
                        .subscribe(val => {
                        });
                    }
                    this.api.get("table/purchasing_order", { params: { filter: 'order_no=' + "'" + this.orderno + "'" } }).subscribe(val => {
                      this.pod = val['data'];
                      if (this.podbarcode.length == 0 && this.pod[0].status_location == 'OK') {
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.api.put("table/purchasing_order",
                          {
                            "order_no": detailpo.order_no,
                            "status": 'INPG'
                          },
                          { headers })
                          .subscribe(val => {
                          });
                      }
                    });
                  })
                  this.getPOD();
                });
            }
          }
        }
      ]
    });
    alert.present();
  }
  doOpenOptions(detailpo) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Options',
      buttons: [
        {
          icon: 'md-checkmark-circle-outline',
          text: 'Posting',
          handler: () => {
            this.doPostingRCV(detailpo);
          }
        },
        {
          icon: 'md-open',
          text: 'Location',
          handler: () => {
            this.batch = detailpo.batch_no;
            this.item = detailpo.item_no;
            this.position = detailpo.location;
            this.qty = detailpo.qty;
            return new Promise(resolve => {
              this.getLocations(detailpo).subscribe(val => {
                let data = val['data'];
                for (let i = 0; i < data.length; i++) {
                  this.locations.push(data[i]);
                  this.totaldatalocation = val['count'];
                }
                if (detailpo.location == '' && this.status == 'INP2' && this.locations.length) {
                  this.myFormModal.get('location').setValue(this.locations[0].location_alocation);
                  document.getElementById("myModal").style.display = "block";
                  this.receivingno = detailpo.code;
                }
                else {
                  this.myFormModal.get('location').setValue(detailpo.location);
                  document.getElementById("myModal").style.display = "block";
                  this.receivingno = detailpo.code;
                }
                resolve();
              });
            });
          }
        },
        {
          icon: 'md-barcode',
          text: 'Barcode',
          handler: () => {
            let locationModal = this.modalCtrl.create('BarcodelistPage', {
              batchno: detailpo.batch_no,
              orderno: detailpo.order_no,
              itemno: detailpo.item_no,
              qty: detailpo.qty
            },
              { cssClass: "modal-fullscreen" });
            locationModal.present();
          }
        },
        {
          icon: 'md-close',
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });

    actionSheet.present();
  }
  onChange(user) {
    this.userpic = user.id_user;
  }
  doSendNotification() {
    this.api.get("table/user", { params: { filter: "id_user=" + "'" + this.userpic + "'" } })
      .subscribe(val => {
        this.usertoken = val['data'];
        const headers = new HttpHeaders({
          "Content-Type": "application/json",
          "Authorization": "key=AAAAtsHtkUc:APA91bF8isugU-XkNTVVYVC-eQQJxn1UI4wBqUcbuXNvh2yUAS3CfDCxDB8himPNr4wJx8f5KPezZpY_jpTr8_WegNEiJ1McJAriwYJZ5iOv0Q1X6CXnDn_xZeGbWX-V6DnPk7XImX5L"
        })
        this.http.post("https://fcm.googleapis.com/fcm/send",
          {
            "to": this.usertoken[0].token,
            "notification": {
              "body": "You have new notifications",
              "title": "Atria Warehouse",
              "content_available": true,
              "priority": 2,
              "sound": "default",
              "click_action": "FCM_PLUGIN_ACTIVITY",
              "color": "#FFFFFF",
              "icon": "atria"
            },
            "data": {
              "body": "You have new notifications",
              "title": "Atria Warehouse",
              "key_1": "Data for key one",
              "key_2": "Hellowww"
            }
          },
          { headers })
          .subscribe(data => {
          }, (e) => {
          });
      });

  }
  getNextNoRCV() {
    return this.api.get('nextno/receiving/receiving_no')
  }

}