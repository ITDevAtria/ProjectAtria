import { Component } from '@angular/core';
import { LoadingController, FabContainer, ActionSheetController, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { UUID } from 'angular2-uuid';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-picking',
  templateUrl: 'picking.html',
})
export class PickingPage {
  myFormModal: FormGroup;
  private location_master = [];
  private division = [];
  private picking = [];
  private pickingrelease = [];
  private putawaytemp = [];
  private getputawaylist = [];
  private location = [];
  private listpicking = [];
  private listpickingdetail = [];
  private putawayfound = [];
  private usertoken = [];
  private users = [];
  searchrcv: any;
  searchloc: any;
  searchpicking: any;
  halaman = 0;
  totaldata: any;
  totaldatapicking: any;
  totaldatapickingdetail: any;
  totaldatalistpicking: any;
  divisioncode = '';
  divdesc = '';
  setdiv = '';
  docno = '';
  receiptno = '';
  batchno = '';
  itemno = '';
  locationcode = '';
  position = '';
  divisionno = '';
  qty = '';
  qtyprevious = '';
  putawayno = '';
  unit = '';
  rcvlist = '';
  barcodeno = '';
  rackno = '';
  sortPICK = '';
  filter = '';
  public totalqty: any;
  private nextno = '';
  public toggled: boolean = false;
  public detailpick: boolean = false;
  public detailpicklist: boolean = false;
  pick: string = "picking";
  public buttonText: string;
  public loading: boolean;
  option: BarcodeScannerOptions;
  data = {};
  groupby = '';
  search = '';
  itemnolist = '';
  invoicelist = '';
  roomlist = '';
  private token: any;
  public userid = [];
  public role = [];
  public rolearea = '';
  public rolegroup = '';
  public roleid = '';
  public userpic = '';
  public loader: any;
  public uuid: any;
  public name: any;
  public pickingreleasesearch = [];
  public listpickingsearch = [];
  public totaldatalistpickingsearch: any;

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
    private http: HttpClient,
    public loadingCtrl: LoadingController
  ) {
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Content...'
    });
    this.loader.present();
    this.myFormModal = formBuilder.group({
      pic: ['', Validators.compose([Validators.required])],
    })
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.storage.get('userid').then((val) => {
      this.userid = val;
      console.log(this.userid)
      this.doListPickingDetail();
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          if (this.role.length != 0) {
            this.rolearea = this.role[0].id_area
            this.rolegroup = this.role[0].id_group
            this.roleid = this.role[0].id_role
            console.log(this.roleid, this.rolearea, this.rolegroup)
            if (this.rolegroup == "STAFF") {
              this.pick = "picking"
            }
            else {
              this.pick = "listpicking"
            }
          }
        })
    });
    this.getPickingSearch();
    this.getpicking();
    this.toggled = false;
    this.groupby = ""
    this.search = 'invoice_no';
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
  getpicking() {
    return new Promise(resolve => {
      let offsetpicking = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Header", offset: offsetpicking, filter: "Status=0", sort: "[Expected Receipt Date]" + " ASC " } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + data[i]["Receipt No_"] + "'" } })
                .subscribe(val => {
                  this.pickingrelease = val['data'];
                  if (this.pickingrelease.length == 0) {
                    this.listpicking.push(data[i]);
                    this.totaldatalistpicking = val['count'];
                  }
                  else if (this.pickingrelease.length) {
                    if (this.pickingrelease[0].status == 'OPEN') {
                      this.listpicking.push(data[i]);
                      this.totaldatalistpicking = val['count'];
                    }
                  }
                });
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    });
  }
  getPickingSearch() {
    this.api.get("tablenav", { params: { limit: 10000, table: "CSB_LIVE$Delivery Management Header", filter: "Status=0", sort: "[Expected Receipt Date]" + " ASC " } })
    .subscribe(val => {
      let data = val['data'];
      for (let i = 0; i < data.length; i++) {
        this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + data[i]["Receipt No_"] + "'" } })
          .subscribe(val => {
            this.pickingreleasesearch = val['data'];
            if (this.pickingreleasesearch.length == 0) {
              this.listpickingsearch.push(data[i]);
              this.totaldatalistpickingsearch = val['count'];
              this.searchpicking = this.listpickingsearch;
            }
            else if (this.pickingreleasesearch.length) {

            }
          });
      }
    });
  }
  /*getSetGroupBy(groupby) {
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='OPEN'", group: groupby, groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.listpicking = val['data'];
        this.totaldatalistpicking = val['count'];
        this.searchpicking = this.listpicking;
      });
  }
  getDetailGroupByInvoice(listpick) {
    this.listpickingdetail = [];
    this.detailpicklist = this.detailpicklist ? false : true
    this.invoicelist = listpick.invoice_no
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "invoice_no=" + "'" + listpick.invoice_no + "'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
        this.totaldatapickingdetail = val['count'];
      });
  }
  getDetailGroupByItems(listpick) {
    this.listpickingdetail = [];
    this.detailpicklist = this.detailpicklist ? false : true
    this.itemnolist = listpick.item_no
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "item_no=" + "'" + listpick.item_no + "'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
        this.totaldatapickingdetail = val['count'];
      });
  }
  getDetailGroupByRoom(listpick) {
    this.listpickingdetail = [];
    this.detailpicklist = this.detailpicklist ? false : true
    this.roomlist = listpick.room
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "room=" + "'" + listpick.room + "'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
        this.totaldatapickingdetail = val['count'];
      });
  }
  getSearchInvoice(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.invoice_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.listpicking;
    }
  }
  getSearchItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.listpicking;
    }
  }
  getSearchRoom(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.room.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.searchpicking;
    }
  }*/
  getSearchGroupInvoice(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick["Receipt No_"].toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.searchpicking;
    }
  }
  /*getSearchGroupItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.searchpicking;
    }
  }
  getSearchGroupRoom(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.room.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.searchpicking;
    }
  }*/
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfinite(infiniteScroll) {
    this.getpicking().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }

  doRefreshpicking(refresher) {
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='OPEN'" } })
      .subscribe(val => {
        this.listpicking = val['data'];
        this.totaldatapicking = val['count'];
        this.searchpicking = this.listpicking;
        refresher.complete();
      });
  }
  doRefreshpickingDetail(refresher) {
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='INP1'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
        this.totaldatapickingdetail = val['count'];
        refresher.complete();
      });
  }

  doSortPICK(filter) {
    if (this.sortPICK == 'ASC') {
      this.sortPICK = 'DESC'
    }
    else {
      this.sortPICK = 'ASC'
    }
    this.api.get("table/picking_list", { params: { filter: "status='OPEN'", sort: filter + " " + this.sortPICK + " " } }).subscribe(val => {
      this.listpicking = val['data'];
      this.totaldatalistpicking = val['count'];
      this.filter = filter
    });
  }
  doSortPICKDetail(filter, listpick) {

  }
  getUsers() {
    this.api.get('table/user_role', { params: { filter: "id_area='INBOUND' AND id_group='STAFF'" } }).subscribe(val => {
      this.users = val['data'];
    });
  }
  onChange(user) {
    this.userpic = user.id_user;
  }
  doOffToPIC() {
    document.getElementById("myModalPic").style.display = "none";
    this.myFormModal.reset()
  }
  doOpenToPIC(listpick) {
    this.getUsers();
    this.getInfoPIC(listpick)
    document.getElementById("myModalPic").style.display = "block";
    this.receiptno = listpick["Receipt No_"]
  }
  getInfoPIC(listpick) {
    this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + listpick["Receipt No_"] + "'" } })
      .subscribe(val => {
        this.pickingrelease = val['data'];
        if (this.pickingrelease.length == 0) {
        }
        else if (this.pickingrelease.length != 0) {
          if (this.pickingrelease[0].status == 'OPEN') {
            this.myFormModal.get('pic').setValue(this.pickingrelease[0].pic);
          }
        }
      });
  }
  doSendToPic() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let uuid = UUID.UUID();
    this.uuid = uuid;
    this.api.post("table/picking_list",
      {
        "receipt_no": this.receiptno,
        "pic": this.myFormModal.value.pic,
        "status": 'OPEN',
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
          this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + this.receiptno + "'" } })
            .subscribe(val => {
              this.pickingrelease = val['data'];
            });
          this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Header", filter: "Status=0", sort: "[Expected Receipt Date]" + " ASC " } })
            .subscribe(val => {
              let data = val['data'];
              for (let i = 0; i < data.length; i++) {
                this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + data[i]["Receipt No_"] + "'" } })
                  .subscribe(val => {
                    this.pickingrelease = val['data'];
                    if (this.pickingrelease.length == 0) {
                      this.listpicking.push(data[i]);
                      this.totaldatalistpicking = val['count'];
                      this.searchpicking = this.listpicking;
                    }
                    else if (this.pickingrelease.length) {
                      if (this.pickingrelease[0].status == 'OPEN') {
                        this.listpicking.push(data[i]);
                        this.totaldatalistpicking = val['count'];
                        this.searchpicking = this.listpicking;
                      }
                    }
                  });
              }
            });
        });
  }
  doSendNotificationPic(listpick) {
    this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + listpick["Receipt No_"] + "'" } })
      .subscribe(val => {
        this.pickingrelease = val['data'];
        if (this.pickingrelease.length == 0) {
          let alert = this.alertCtrl.create({
            title: 'Error',
            subTitle: 'Pic belum diisi',
            buttons: ['OK']
          });
          alert.present();
        }
        else if (this.pickingrelease.length != 0) {
          if (this.pickingrelease[0].pic == '') {
            let alert = this.alertCtrl.create({
              title: 'Error',
              subTitle: 'Pic belum diisi',
              buttons: ['OK']
            });
            alert.present();
          }
          else {
            this.api.get("table/user", { params: { filter: "id_user=" + "'" + this.pickingrelease[0].pic + "'" } })
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
                      "param": "PICKING"
                    }
                  },
                  { headers })
                  .subscribe(data => {
                    let alert = this.alertCtrl.create({
                      title: 'Sukses',
                      subTitle: 'Pekerjaan Picking Sukses di kirim',
                      buttons: ['OK']
                    });
                    alert.present();
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");
                    this.api.put("table/picking_list",
                      {
                        "receipt_no": listpick["Receipt No_"],
                        "receipt_date": listpick["Receipt Date"],
                        "expected_receipt_date": listpick["Expected Receipt Date"],
                        "store_no": listpick["Store No_"],
                        "so_no": listpick["SO No_"],
                        "status": 'INP1'
                      },
                      { headers })
                      .subscribe(val => {
                        this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Line", filter: "[Receipt No_]=" + "'" + listpick["Receipt No_"] + "'" } })
                          .subscribe(val => {
                            let data = val['data'];
                            for (let i = 0; i < data.length; i++) {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              let uuid = UUID.UUID();
                              this.uuid = uuid;
                              this.api.post("table/picking_list_detail",
                                {
                                  "id": data[i]["Receipt No_"] + data[i]["Line No_"],
                                  "receipt_no": data[i]["Receipt No_"],
                                  "item_no": data[i]["Item No_"],
                                  "description": data[i].Description,
                                  "qty": data[i].Quantity,
                                  "sent_by": data[i]["Sent By"],
                                  "sjl_from": data[i]["SJL From"],
                                  "UOM": data[i].UOM,
                                  "retail_so_no": data[i]["Retail SO No_"],
                                  "uuid": this.uuid
                                },
                                { headers })
                                .subscribe(val => {

                                });
                            }
                          });
                        this.doListPickingDetail();
                        this.listpicking = [];
                        this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Header", filter: "Status=0", sort: "[Expected Receipt Date]" + " ASC " } })
                          .subscribe(val => {
                            let data = val['data'];
                            for (let i = 0; i < data.length; i++) {
                              this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + data[i]["Receipt No_"] + "'" } })
                                .subscribe(val => {
                                  this.pickingrelease = val['data'];
                                  if (this.pickingrelease.length == 0) {
                                    this.listpicking.push(data[i]);
                                    this.totaldatalistpicking = val['count'];
                                    this.searchpicking = this.listpicking;
                                  }
                                  else if (this.pickingrelease.length) {
                                    if (this.pickingrelease[0].status == 'OPEN') {
                                      this.listpicking.push(data[i]);
                                      this.totaldatalistpicking = val['count'];
                                      this.searchpicking = this.listpicking;
                                    }
                                  }
                                });
                            }
                          });
                      });
                  }, (e) => {
                  });
              });
          }
        }
      });

  }
  viewDetail(listpick) {
    this.navCtrl.push('PickingdetailPage', {
      receiptno: listpick["Receipt No_"]
    });
  }
  viewDetailPicking(listpickdetail) {
    this.navCtrl.push('PickingdetailpartPage', {
      receiptno: listpickdetail.receipt_no
    });
  }
  doListPickingDetail() {
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='INP1'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
      });
  }
}
