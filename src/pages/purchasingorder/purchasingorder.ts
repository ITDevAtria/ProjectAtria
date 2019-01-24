import { Component } from '@angular/core';
import { Events, LoadingController, ActionSheetController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FileChooser } from "@ionic-native/file-chooser";
import { FileOpener } from "@ionic-native/file-opener";
import { FilePath } from "@ionic-native/file-path";
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';

@IonicPage()
@Component({
  selector: 'page-purchasingorder',
  templateUrl: 'purchasingorder.html',
})
export class PurchasingorderPage {
  myFormModal: FormGroup;
  myFormModalPrepare: FormGroup;
  private users = [];
  private purchasing_order = [];
  private infopo = [];
  private preparation = [];
  private usertoken = [];
  private userlokasitoken = [];
  private userbarcodetoken = [];
  searchpo: any;
  searchpoaction: any;
  searchinfopo: any;
  searchpreparation: any;
  items = [];
  halaman = 0;
  halamaninfopo = 0;
  halamanpreparation = 0;
  totaldata: any;
  totaldataitem: any;
  totaldatainfopo: any;
  totaldatapreparation: any;
  public toggled: boolean = false;
  orderno = '';
  po: string;
  private width: number;
  private height: number;
  private datearrival = '';
  filter = '';
  sortPO = '';
  sortInfoPO = '';
  sortPrepare = '';
  private token: any;
  private userpic = '';
  private poid = '';
  public userid: any;
  public role = [];
  public roleid = '';
  public loader: any;
  public statussendlocation = '';
  public statussendbarcode = '';
  public uuid = '';
  public porelease = [];
  public name: any;
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
    public fileChooser: FileChooser,
    public fileOpener: FileOpener,
    public filePath: FilePath,
    private platform: Platform,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    private http: HttpClient,
    public events: Events
  ) {
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Content...'
    });
    this.loader.present();
    this.myFormModal = formBuilder.group({
      pic: ['', Validators.compose([Validators.required])],
      location: ['', Validators.compose([Validators.required])],
    })
    this.myFormModalPrepare = formBuilder.group({
      piclokasi: ['', Validators.compose([Validators.required])],
      picbarcode: ['', Validators.compose([Validators.required])],
    })
    this.getPO();
    this.getInfoPO();
    this.getPrepare();
    this.toggled = false;
    platform.ready().then(() => {
      this.width = platform.width();
      this.height = platform.height();
      this.storage.get('name').then((val) => {
        this.name = val;
      });
      this.storage.get('userid').then((val) => {
        this.userid = val;
        this.api.get('table/purchasing_order',
          {
            params: {
              limit: 30, filter:
                "(status='INP2'" + " AND " +
                "((pic=" + "'" + this.userid + "')" +
                " OR " +
                "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
                " OR " +
                "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
            }
          })
          .subscribe(val => {
            this.preparation = val['data'];
          });
        this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
          .subscribe(val => {
            this.role = val['data']
            this.roleid = this.role[0].id_group
            this.rolecab = this.role[0].id_cab
            if (this.roleid != "ADMIN") {
              this.po = "preparation"
            }
            else {
              this.po = "infopo"
            }
          })
      });
    });
    this.sortPO = ''
    this.sortInfoPO = ''
    this.sortPrepare = ''
  }
  doProfile() {
    this.navCtrl.push('UseraccountPage');
  }
  ngAfterViewInit() {
    this.loader.dismiss();
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
  getPO() {
    return new Promise(resolve => {
      let offset = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=0 AND [Document Type]=1", offset: offset, sort: "[Order Date]" + " DESC " } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.purchasing_order.push(data[i]);
              this.totaldata = val['count'];
              this.searchpo = this.purchasing_order;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }
  getInfoPO() {
    return new Promise(resolve => {
      let offsetinfopo = 30 * this.halamaninfopo
      if (this.halamaninfopo == -1) {
        resolve();
      }
      else {
        this.halamaninfopo++;
        this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=1 AND [Document Type]=1", offset: offsetinfopo, sort: "[Order Date]" + " DESC " } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.api.get("table/purchasing_order", { params: { filter: "order_no=" + "'" + data[i].No_ + "'" } })
                .subscribe(val => {
                  this.porelease = val['data'];
                  if (this.porelease.length == 0) {
                    this.infopo.push(data[i]);
                    this.totaldatainfopo = val['count'];
                    this.searchinfopo = this.infopo;
                  }
                  else if (this.porelease.length) {
                    if (this.porelease[0].batch_no == '') {
                      this.infopo.push(data[i]);
                      this.totaldatainfopo = val['count'];
                      this.searchinfopo = this.infopo;
                    }
                  }
                });
            }
            if (data.length == 0) {
              this.halamaninfopo = -1
            }
            resolve();
          });
      }
    })

  }
  getPrepare() {
    return new Promise(resolve => {
      let offsetprepare = 30 * this.halamanpreparation
      if (this.halamanpreparation == -1) {
        resolve();
      }
      else {
        this.halamanpreparation++;
        this.api.get('table/purchasing_order', {
          params: {
            limit: 30, offset: offsetprepare, filter: "(status='INP2'" + " AND " +
              "((pic=" + "'" + this.userid + "')" +
              " OR " +
              "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
              " OR " +
              "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
          }
        })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.preparation.push(data[i]);
              this.totaldatapreparation = val['count'];
              this.searchpreparation = this.preparation;
            }
            if (data.length == 0) {
              this.halamanpreparation = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchPO(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.purchasing_order = this.searchpo.filter(po => {
        return po["No_"].toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.purchasing_order = this.searchpo;
    }
  }
  getSearchInfoPO(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.infopo = this.searchinfopo.filter(infopo => {
        return infopo.No_.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.infopo = this.searchinfopo;
    }
  }
  getSearchPrepare(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.preparation = this.searchpreparation.filter(prepare => {
        return prepare.order_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.preparation = this.searchpreparation;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };
  viewDetail(po) {
    this.navCtrl.push('DetailpoPage', {
      orderno: po.No_,
      batchno: po["Order Date"],
      locationcode: po["Location Code"],
      expectedreceiptdate: po["Order Date"]
    });
  }
  viewDetailInfoPO(info) {
    this.navCtrl.push('DetailpoPage', {
      orderno: info.No_,
      batchno: info["Order Date"],
      locationcode: info["Location Code"],
      expectedreceiptdate: info["Order Date"],
      status: info.Status
    });
  }

  viewDetailPrepare(prepare) {
    this.navCtrl.push('DetailpoactionPage', {
      orderno: prepare.order_no,
      batchno: prepare.batch_no,
      locationcode: prepare.location_code,
      expectedreceiptdate: prepare.expected_receipt_date,
      status: prepare.status,
      pic: prepare.pic,
      piclokasi: prepare.pic_lokasi,
      picbarcode: prepare.pic_barcode,
      rolecab: this.rolecab
    });
  }
  doAddPO() {
    let locationModal = this.modalCtrl.create('PurchasingorderaddPage', this.modalCtrl, { cssClass: "modal-fullscreen" });
    locationModal.present();
  }

  doInfinite(infiniteScroll) {
    this.getPO().then(response => {
      infiniteScroll.complete();

    })
  }
  doInfiniteInfoPO(infiniteScroll) {
    this.getInfoPO().then(response => {
      infiniteScroll.complete();

    })
  }
  doInfiniteprepare(infiniteScroll) {
    this.getPrepare().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }

  doUpdatePO(po) {
    let locationModal = this.modalCtrl.create('PurchasingorderupdatePage',
      {
        orderno: po.order_no,
        vendorno: po.vendor_no,
        expectedreceiptdate: po.expected_receipt_date,
        locationcode: po.location_code,
        description: po.posting_desc
      },
      { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  doDeletePO(po) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete  ' + po.order_no + ' ?',
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

            this.api.delete("table/purchasing_order", { params: { filter: 'order_no=' + "'" + po.order_no + "'" }, headers })
              .subscribe(
                (val) => {
                  this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=0 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } })
                    .subscribe(val => {
                      this.purchasing_order = val['data'];
                      this.totaldata = val['count'];
                      this.searchpo = this.purchasing_order;
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
  }
  doRefresh(refresher) {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=0 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } }).subscribe(val => {
      this.purchasing_order = val['data'];
      this.totaldata = val['count'];
      this.searchpo = this.purchasing_order;
      refresher.complete();
    });
  }
  doRefreshInfoPO(refresher) {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=1 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } })
      .subscribe(val => {
        let data = val['data'];
        for (let i = 0; i < data.length; i++) {
          this.api.get("table/purchasing_order", { params: { filter: "order_no=" + "'" + data[i].No_ + "'" } })
            .subscribe(val => {
              this.porelease = val['data'];
              if (this.porelease.length == 0) {
                this.infopo.push(data[i]);
                this.totaldatainfopo = val['count'];
                this.searchinfopo = this.infopo;
              }
              else if (this.porelease.length) {
                if (this.porelease[0].batch_no == '') {
                  this.infopo.push(data[i]);
                  this.totaldatainfopo = val['count'];
                  this.searchinfopo = this.infopo;
                }
              }
            });
        }
        refresher.complete();
      });
  }

  doRefreshPrepare(refresher) {
    this.api.get("table/purchasing_order", {
      params: {
        limit: 30, filter: "(status='INP2'" + " AND " +
          "((pic=" + "'" + this.userid + "')" +
          " OR " +
          "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
          " OR " +
          "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
      }
    }).subscribe(val => {
      this.preparation = val['data'];
      this.totaldatapreparation = val['count'];
      this.searchpreparation = this.preparation;
      refresher.complete();
    });
  }
  chooseFile() {
    this.fileChooser.open().then(file => {
      this.filePath.resolveNativePath(file).then(resolvedFilePath => {
        this.fileOpener.open(resolvedFilePath, 'application/pdf').then(value => {
          alert('Sukses')
        }).catch(err => {
          alert(JSON.stringify(err));
        });
      }).catch(err => {
        alert(JSON.stringify(err));
      })
    })
  }

  doPostingPO(po) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting  ' + po.order_no + ' ?',
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

            let date = moment().format('YYYY-MM-DD');
            this.api.put("table/purchasing_order",
              {
                "order_no": po.order_no,
                "status": 'INP1'
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
                  this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=0 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } }).subscribe(val => {
                    this.purchasing_order = val['data'];
                    this.totaldata = val['count'];
                    this.searchpo = this.purchasing_order;
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
  }
  doPostingInfoPO(info) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting Order No ' + info.No_ + ' ?',
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
            let batch = moment(info["Order Date"]).format('YYMMDD');
            this.api.put("table/purchasing_order",
              {
                "order_no": info.No_,
                "batch_no": batch,
                "vendor_no": info["Buy-from Vendor No_"],
                "vendor_status": info["Gen_ Bus_ Posting Group"],
                "expected_receipt_date": info["Order Date"],
                "location_code": '81003',
                "status": 'INP2',
                "total_item_post": 0
              },
              { headers })
              .subscribe(
                (val) => {
                  this.api.get("table/purchasing_order", { params: { filter: "order_no=" + "'" + info.No_ + "'" } })
                    .subscribe(val => {
                      this.porelease = val['data'];
                      let pic = this.porelease[0].pic;
                      console.log(pic)
                      this.doSendNotificationPic(pic)
                      this.infopo = [];
                      this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=1 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } })
                        .subscribe(val => {
                          let data = val['data'];
                          for (let i = 0; i < data.length; i++) {
                            this.api.get("table/purchasing_order", { params: { filter: "order_no=" + "'" + data[i].No_ + "'" } })
                              .subscribe(val => {
                                this.porelease = val['data'];
                                if (this.porelease.length == 0) {
                                  this.infopo.push(data[i]);
                                  this.totaldatainfopo = val['count'];
                                  this.searchinfopo = this.infopo;
                                }
                                else if (this.porelease.length) {
                                  if (this.porelease[0].batch_no == '') {
                                    this.infopo.push(data[i]);
                                    this.totaldatainfopo = val['count'];
                                    this.searchinfopo = this.infopo;
                                  }
                                }
                              });
                          }
                        });
                      this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Line", filter: "[Document No_]=" + "'" + info.No_ + "'" } })
                        .subscribe(val => {
                          let data = val['data'];
                          for (let i = 0; i < data.length; i++) {
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            let uuid = UUID.UUID();
                            this.uuid = uuid;
                            let batch = moment(data[i]["Expected Receipt Date"]).format('YYMMDD');
                            let code = data[i]["Document No_"] + data[i].No_
                            let qty = parseInt(data[i].Quantity)
                            this.api.post("table/purchasing_order_detail",
                              {
                                "code": code,
                                "order_no": data[i]["Document No_"],
                                "line_no": data[i]["Line No_"],
                                "batch_no": batch,
                                "item_no": data[i].No_,
                                "location_code": '81003',
                                "expected_receipt_date": data[i]["Expected Receipt Date"],
                                "description": data[i].Description,
                                "unit": data[i]["Unit of Measure"],
                                "qty": qty,
                                "vendor_no": data[i]["Buy-from Vendor No_"],
                                "vendor_status": data[i]["Gen_ Bus_ Posting Group"],
                                "division": data[i].Division,
                                "item_category_code": data[i]["Item Category Code"],
                                "product_group_code": data[i]["Product Group Code"],
                                "status": 'OPEN',
                                "uuid": this.uuid
                              },
                              { headers })
                              .subscribe(
                                (val) => {
                                }, err => {
                                  this.api.post("table/purchasing_order_detail",
                              {
                                "code": code,
                                "order_no": data[i]["Document No_"],
                                "line_no": data[i]["Line No_"],
                                "batch_no": batch,
                                "item_no": data[i].No_,
                                "location_code": '81003',
                                "expected_receipt_date": data[i]["Expected Receipt Date"],
                                "description": data[i].Description,
                                "unit": data[i]["Unit of Measure"],
                                "qty": qty,
                                "vendor_no": data[i]["Buy-from Vendor No_"],
                                "vendor_status": data[i]["Gen_ Bus_ Posting Group"],
                                "division": data[i].Division,
                                "item_category_code": data[i]["Item Category Code"],
                                "product_group_code": data[i]["Product Group Code"],
                                "status": 'OPEN',
                                "uuid": this.uuid
                              },
                              { headers })
                              .subscribe(
                                (val) => {
                                }, err => {
                                  this.api.post("table/purchasing_order_detail",
                              {
                                "code": code,
                                "order_no": data[i]["Document No_"],
                                "line_no": data[i]["Line No_"],
                                "batch_no": batch,
                                "item_no": data[i].No_,
                                "location_code": '81003',
                                "expected_receipt_date": data[i]["Expected Receipt Date"],
                                "description": data[i].Description,
                                "unit": data[i]["Unit of Measure"],
                                "qty": qty,
                                "vendor_no": data[i]["Buy-from Vendor No_"],
                                "vendor_status": data[i]["Gen_ Bus_ Posting Group"],
                                "division": data[i].Division,
                                "item_category_code": data[i]["Item Category Code"],
                                "product_group_code": data[i]["Product Group Code"],
                                "status": 'OPEN',
                                "uuid": this.uuid
                              },
                              { headers })
                              .subscribe(
                                (val) => {
                                }, err => {
                                  
                                });
                                });
                                });
                          }
                        });
                    });
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Posting Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
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
  doPostingPrepare(prepare) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting Order No  ' + prepare.order_no + ' ?',
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

            this.api.put("table/purchasing_order",
              {
                "order_no": prepare.order_no,
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
                  this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=1 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } }).subscribe(val => {
                    this.infopo = val['data'];
                    this.totaldatainfopo = val['count'];
                    this.searchinfopo = this.infopo;
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
  }
  doOpenOptions(po) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Options',
      buttons: [
        {
          icon: 'md-checkmark-circle-outline',
          text: 'Posting',
          handler: () => {
            let alert = this.alertCtrl.create({
              title: 'Confirm Posting',
              message: 'Do you want to posting  ' + po.order_no + ' ?',
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

                    this.api.put("table/purchasing_order",
                      {
                        "order_no": po.order_no,
                        "status": 'INP1'
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
                          this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=0 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } }).subscribe(val => {
                            this.purchasing_order = val['data'];
                            this.totaldata = val['count'];
                            this.searchpo = this.purchasing_order;
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
          }
        },
        {
          icon: 'md-open',
          text: 'Update',
          handler: () => {
            let locationModal = this.modalCtrl.create('PurchasingorderupdatePage',
              {
                orderno: po.order_no,
                vendorno: po.vendor_no,
                expectedreceiptdate: po.expected_receipt_date,
                locationcode: po.location_code,
                description: po.posting_desc
              },
              { cssClass: "modal-fullscreen" });
            locationModal.present();
          }
        },
        {
          icon: 'md-trash',
          text: 'Delete',
          handler: () => {
            let alert = this.alertCtrl.create({
              title: 'Confirm Delete',
              message: 'Are you sure you want to delete  ' + po.order_no + ' ?',
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

                    this.api.delete("table/purchasing_order", { params: { filter: 'order_no=' + "'" + po.order_no + "'" }, headers })
                      .subscribe(
                        (val) => {
                          this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=0 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } }).subscribe(val => {
                            this.purchasing_order = val['data'];
                            this.totaldata = val['count'];
                            this.searchpo = this.purchasing_order;
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
  doListBarcode(prepare) {
    let locationModal = this.modalCtrl.create('BarcodelistPage', {
      batchno: prepare.batch_no,
      orderno: prepare.order_no
    },
      { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  doSortPO(filter) {
    if (this.sortPO == 'ASC') {
      this.sortPO = 'DESC'
    }
    else {
      this.sortPO = 'ASC'
    }
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=0 AND [Document Type]=1", sort: filter + " " + this.sortPO + " " } }).subscribe(val => {
      this.purchasing_order = val['data'];
      this.totaldata = val['count'];
      this.filter = filter
    });
  }
  doSortInfoPO(filter) {
    if (this.sortInfoPO == 'ASC') {
      this.sortInfoPO = 'DESC'
    }
    else {
      this.sortInfoPO = 'ASC'
    }
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=1 AND [Document Type]=1", sort: filter + " " + this.sortInfoPO + " " } }).subscribe(val => {
      this.infopo = val['data'];
      this.totaldatainfopo = val['count'];
      this.filter = filter
    });
  }
  doSortPrepare(filter) {
    if (this.sortPrepare == 'ASC') {
      this.sortPrepare = 'DESC'
    }
    else {
      this.sortPrepare = 'ASC'
    }
    this.api.get("table/purchasing_order", { params: { filter: "status='INP2'" + " AND " + "pic=" + "'" + this.userid + "'", sort: filter + " " + this.sortPrepare + " " } }).subscribe(val => {
      this.preparation = val['data'];
      this.totaldatapreparation = val['count'];
      this.filter = filter
    });
  }
  selectdatePO(datearrivalPO) {
    if (datearrivalPO == '') {
      this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=0 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } }).subscribe(val => {
        this.purchasing_order = val['data'];
        this.totaldata = val['count'];
      });
    }
    else {
      this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=0 AND [Document Type]=1" + " AND " + "[Order Date]" + "'" + datearrivalPO + "'" } }).subscribe(val => {
        this.purchasing_order = val['data'];
        this.totaldata = val['count'];
      });
    }
  }
  selectdateInfoPO(datearrivalInfoPO) {
    if (datearrivalInfoPO == '') {
      this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=1 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } }).subscribe(val => {
        this.infopo = val['data'];
        this.totaldatainfopo = val['count'];
      });
    }
    else {
      this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=1 AND [Document Type]=1" + " AND " + "[Order Date]=" + "'" + datearrivalInfoPO + "'" } }).subscribe(val => {
        this.infopo = val['data'];
        this.totaldatainfopo = val['count'];
      });
    }
  }
  selectdatePrepare(datearrivalPrepare) {
    if (datearrivalPrepare == '') {
      this.api.get("table/purchasing_order", { params: { filter: "status='INP2'" + " AND " + "pic=" + "'" + this.userid + "'" } }).subscribe(val => {
        this.preparation = val['data'];
        this.totaldatapreparation = val['count'];
      });
    }
    else {
      this.api.get("table/purchasing_order", { params: { filter: "status='INP2'" + " AND " + "pic=" + "'" + this.userid + "'" + " AND " + "transfer_date=" + "'" + datearrivalPrepare + "'" } }).subscribe(val => {
        this.preparation = val['data'];
        this.totaldatapreparation = val['count'];
      });
    }
  }
  getUsers() {
    this.api.get('table/user_role', { params: { filter: "id_area='INBOUND' AND id_group='TL'" } }).subscribe(val => {
      this.users = val['data'];
    });
  }
  getUsersStaff() {
    this.api.get('table/user_role', { params: { filter: "id_area='INBOUND' AND id_group='STAFF'" } }).subscribe(val => {
      this.users = val['data'];
    });
  }
  doOpenToPIC(info) {
    this.getUsers();
    this.getInfoPORelease(info);
    document.getElementById("myModalPic").style.display = "block";
    this.orderno = info.No_;
  }
  doOpenToPICPrepare(prepare) {
    this.getUsersStaff();
    this.myFormModalPrepare.get('piclokasi').setValue(prepare.pic_lokasi);
    this.myFormModalPrepare.get('picbarcode').setValue(prepare.pic_barcode);
    document.getElementById("myModalPicPrepare").style.display = "block";
    this.orderno = prepare.order_no;
    this.statussendlocation = prepare.status_send_pic_lokasi;
    this.statussendbarcode = prepare.status_send_pic_barcode;
  }
  doOffToPIC() {
    document.getElementById("myModalPic").style.display = "none";
    this.myFormModal.reset()
  }
  doOffToPICPrepare() {
    document.getElementById("myModalPicPrepare").style.display = "none";
    this.myFormModalPrepare.reset()
  }
  onChange(user) {
    this.userpic = user.id_user;
  }
  doSendToPic() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let uuid = UUID.UUID();
    this.uuid = uuid;
    this.api.post("table/purchasing_order",
      {
        "order_no": this.orderno,
        "pic": this.myFormModal.value.pic,
        "uuid": this.uuid
      },
      { headers })
      .subscribe(
        (val) => {
          document.getElementById("myModalPic").style.display = "none";
          this.myFormModal.reset()
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Save Sukses',
            buttons: ['OK']
          });
          alert.present();
          this.api.get("table/purchasing_order", { params: { filter: "order_no=" + "'" + this.orderno + "'" } })
            .subscribe(val => {
              this.porelease = val['data'];
            });
          this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Header", filter: "Status=1 AND [Document Type]=1", sort: "[Order Date]" + " DESC " } })
            .subscribe(val => {
              let data = val['data'];
              for (let i = 0; i < data.length; i++) {
                this.api.get("table/purchasing_order", { params: { filter: "order_no=" + "'" + data[i].No_ + "'" } })
                  .subscribe(val => {
                    this.porelease = val['data'];
                    if (this.porelease.length == 0) {
                      this.infopo.push(data[i]);
                      this.totaldatainfopo = val['count'];
                      this.searchinfopo = this.infopo;
                    }
                    else if (this.porelease.length) {
                      if (this.porelease[0].batch_no == '') {
                        this.infopo.push(data[i]);
                        this.totaldatainfopo = val['count'];
                        this.searchinfopo = this.infopo;
                      }
                    }
                  });
              }
            });
        }, err => {
          this.doSendToPic()
        });
  }
  doSendToPicPrepare() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/purchasing_order",
      {
        "order_no": this.orderno,
        "pic_lokasi": this.myFormModalPrepare.value.piclokasi,
        "pic_barcode": this.myFormModalPrepare.value.picbarcode
      },
      { headers })
      .subscribe(
        (val) => {
          document.getElementById("myModalPicPrepare").style.display = "none";
          this.myFormModalPrepare.reset()
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Save Sukses',
            buttons: ['OK']
          });
          alert.present();
          this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='INP2'" + " AND " + "(pic=" + "'" + this.userid + "'" + " OR " + "pic_lokasi=" + "'" + this.userid + "'" + " OR " + "pic_barcode=" + "'" + this.userid + "')" } }).subscribe(val => {
            this.preparation = val['data'];
            this.totaldatapreparation = val['count'];
            this.searchpreparation = this.preparation;
          });
        },
        response => {
        },
        () => {
        });
  }
  doSendPrepare(prepare) {
    if (prepare.pic_lokasi != '' && prepare.status_send_pic_lokasi != 'OK') {
      this.api.get("table/user", { params: { filter: "id_user=" + "'" + prepare.pic_lokasi + "'" } })
        .subscribe(val => {
          this.userlokasitoken = val['data'];
          const headers = new HttpHeaders({
            "Content-Type": "application/json",
            "Authorization": "key=AAAAtsHtkUc:APA91bF8isugU-XkNTVVYVC-eQQJxn1UI4wBqUcbuXNvh2yUAS3CfDCxDB8himPNr4wJx8f5KPezZpY_jpTr8_WegNEiJ1McJAriwYJZ5iOv0Q1X6CXnDn_xZeGbWX-V6DnPk7XImX5L"
          })
          this.http.post("https://fcm.googleapis.com/fcm/send",
            {
              "to": this.userlokasitoken[0].token,
              "notification": {
                "body": this.userlokasitoken[0].name + ", Mohon dipersiapkan lokasi untuk kedatangan PO " + prepare.order_no,
                "title": "Atria Warehouse",
                "content_available": true,
                "priority": 2,
                "sound": "default",
                "click_action": "FCM_PLUGIN_ACTIVITY",
                "color": "#FFFFFF",
                "icon": "atria"
              },
              "data": {
                "body": this.userlokasitoken[0].name + ", Mohon dipersiapkan lokasi untuk kedatangan PO " + prepare.order_no,
                "title": "Atria Warehouse",
                "param": "PO"
              }
            },
            { headers })
            .subscribe(data => {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.put("table/purchasing_order",
                {
                  "order_no": prepare.order_no,
                  "status_send_pic_lokasi": 'OK'
                },
                { headers })
                .subscribe(val => {
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Pekerjaan Persiapan Lokasi Sukses di kirim',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='INP2'" + " AND " + "(pic=" + "'" + this.userid + "'" + " OR " + "pic_lokasi=" + "'" + this.userid + "'" + " OR " + "pic_barcode=" + "'" + this.userid + "')" } }).subscribe(val => {
                    this.preparation = val['data'];
                    this.totaldatapreparation = val['count'];
                    this.searchpreparation = this.preparation;
                  });
                })
            }, (e) => {
            });
        });
    }
    if (prepare.pic_barcode != '' && prepare.status_send_pic_barcode != 'OK') {
      this.api.get("table/user", { params: { filter: "id_user=" + "'" + prepare.pic_barcode + "'" } })
        .subscribe(val => {
          this.userbarcodetoken = val['data'];
          const headers = new HttpHeaders({
            "Content-Type": "application/json",
            "Authorization": "key=AAAAtsHtkUc:APA91bF8isugU-XkNTVVYVC-eQQJxn1UI4wBqUcbuXNvh2yUAS3CfDCxDB8himPNr4wJx8f5KPezZpY_jpTr8_WegNEiJ1McJAriwYJZ5iOv0Q1X6CXnDn_xZeGbWX-V6DnPk7XImX5L"
          })
          this.http.post("https://fcm.googleapis.com/fcm/send",
            {
              "to": this.userbarcodetoken[0].token,
              "notification": {
                "body": this.userbarcodetoken[0].name + ", Mohon dipersiapkan barcode untuk kedatangan PO " + prepare.order_no,
                "title": "Atria Warehouse",
                "content_available": true,
                "priority": 2,
                "sound": "default",
                "click_action": "FCM_PLUGIN_ACTIVITY",
                "color": "#FFFFFF",
                "icon": "atria"
              },
              "data": {
                "body": this.userbarcodetoken[0].name + ", Mohon dipersiapkan barcode untuk kedatangan PO " + prepare.order_no,
                "title": "Atria Warehouse",
                "param": "PO"
              }
            },
            { headers })
            .subscribe(data => {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.put("table/purchasing_order",
                {
                  "order_no": prepare.order_no,
                  "status_send_pic_barcode": 'OK'
                },
                { headers })
                .subscribe(val => {
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Pekerjaan Persiapan Barcode Sukses di kirim',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='INP2'" + " AND " + "(pic=" + "'" + this.userid + "'" + " OR " + "pic_lokasi=" + "'" + this.userid + "'" + " OR " + "pic_barcode=" + "'" + this.userid + "')" } }).subscribe(val => {
                    this.preparation = val['data'];
                    this.totaldatapreparation = val['count'];
                    this.searchpreparation = this.preparation;
                  });
                })
            }, (e) => {
            });
        });
    }
  }
  doSendNotificationPic(pic) {
    console.log(pic)
    this.api.get("table/user", { params: { filter: "id_user=" + "'" + pic + "'" } })
      .subscribe(val => {
        this.usertoken = val['data'];
        console.log(this.usertoken)
        const headers = new HttpHeaders({
          "Content-Type": "application/json",
          "Authorization": "key=AAAAtsHtkUc:APA91bF8isugU-XkNTVVYVC-eQQJxn1UI4wBqUcbuXNvh2yUAS3CfDCxDB8himPNr4wJx8f5KPezZpY_jpTr8_WegNEiJ1McJAriwYJZ5iOv0Q1X6CXnDn_xZeGbWX-V6DnPk7XImX5L"
        })
        this.http.post("https://fcm.googleapis.com/fcm/send",
          {
            "to": this.usertoken[0].token,
            "notification": {
              "body": this.usertoken[0].name + ", You have new job ",
              "title": "Atria Warehouse",
              "content_available": true,
              "priority": 2,
              "sound": "default",
              "click_action": "FCM_PLUGIN_ACTIVITY",
              "color": "#FFFFFF",
              "icon": "atria"
            },
            "data": {
              "body": this.usertoken[0].name + ", You have new job ",
              "title": "Atria Warehouse",
              "param": "PO"
            }
          },
          { headers })
          .subscribe(data => {
          }, (e) => {
          });
      });

  }
  getInfoPORelease(info) {
    this.api.get("table/purchasing_order", { params: { filter: "order_no=" + "'" + info.No_ + "'" } })
      .subscribe(val => {
        this.porelease = val['data'];
        if (this.porelease.length == 0) {
        }
        else if (this.porelease.length != 0) {
          if (this.porelease[0].batch_no == '') {
            this.myFormModal.get('pic').setValue(this.porelease[0].pic);
          }
        }
      });
  }

}