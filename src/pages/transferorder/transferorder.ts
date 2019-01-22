import { Component } from '@angular/core';
import { Events, LoadingController, ActionSheetController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { UUID } from 'angular2-uuid';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";


@IonicPage()
@Component({
  selector: 'page-transferorder',
  templateUrl: 'transferorder.html',
})
export class TransferorderPage {
  myFormModalPic: FormGroup;
  halamanto = 0;
  searchto: any;
  private transferorder = [];
  totaldatato: any;
  filter = '';
  sortTO = '';
  halamantolist = 0;
  searchtolist: any;
  private transferorderlist = [];
  halamantoreceiving = 0;
  searchtoreceiving: any;
  private transferorderreceiving = [];
  totaldatatolist: any;
  totaldatatoreceiving: any;
  sortTOList = '';
  sortTOReceiving = '';
  to: string;
  private width: number;
  private height: number;
  public name: any;
  public users = [];
  public userpic: any;
  public receiptno: any;
  public pickingrelease = [];
  public uuid: any;
  public listpicking = [];
  public totaldatalistpicking: any;
  public usertoken = [];
  public searchpicking = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public platform: Platform,
    public modalCtrl: ModalController,
    public storage: Storage,
    private http: HttpClient,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController) {
    this.myFormModalPic = formBuilder.group({
      pic: ['', Validators.compose([Validators.required])],
    })
    platform.ready().then(() => {
      this.width = platform.width();
      this.height = platform.height();
      this.to = 'transferorder'
      this.storage.get('name').then((val) => {
        this.name = val;
      });
      this.api.get('table/transfer_order', { params: { limit: 30, filter: "status='OPEN'" } }).subscribe(val => {
        this.transferorder = val['data']
        console.log(this.transferorder)
      });
      this.api.get('table/transfer_order', { params: { limit: 30, filter: "status='INPG'" } }).subscribe(val => {
        this.transferorderlist = val['data']
        console.log(this.transferorderlist)
      });
      this.api.get('table/transfer_order', { params: { limit: 30, filter: "status='CLS1'" } }).subscribe(val => {
        this.transferorderreceiving = val['data']
        console.log(this.transferorderreceiving)
      });
    })
    this.getTO()
    this.getUsers()
  }
  doProfile() {
    this.navCtrl.push('UseraccountPage');
  }
  getTO() {
    return new Promise(resolve => {
      let offsetprepare = 30 * this.halamanto
      if (this.halamanto == -1) {
        resolve();
      }
      else {
        this.halamanto++;
        this.api.get('table/transfer_order', {
          params: {
            limit: 30, offset: offsetprepare, filter: "status='OPEN'"
          }
        })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.transferorder.push(data[i]);
              this.totaldatato = val['count'];
              this.searchto = this.transferorder;
            }
            if (data.length == 0) {
              this.halamanto = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchTO(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.transferorder = this.searchto.filter(to => {
        return to.to_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.transferorder = this.searchto;
    }
  }
  doInfiniteTO(infiniteScroll) {
    this.getTO().then(response => {
      infiniteScroll.complete();

    })
  }
  doRefreshTO(refresher) {
    this.api.get("table/transfer_order", { params: { limit: 30, filter: "status='OPEN'" } }).subscribe(val => {
      this.transferorder = val['data'];
      this.totaldatato = val['count'];
      this.searchto = this.transferorder;
      refresher.complete();
    });
  }
  doSortTO(filter) {
    if (this.sortTO == 'ASC') {
      this.sortTO = 'DESC'
    }
    else {
      this.sortTO = 'ASC'
    }
    this.api.get("table/transfer_order", { params: { filter: "status='OPEN'", sort: filter + " " + this.sortTO + " " } }).subscribe(val => {
      this.transferorder = val['data'];
      this.totaldatato = val['count'];
      this.filter = filter
    });
  }
  doAddTO() {
    let locationModal = this.modalCtrl.create('TransferorderaddPage', this.modalCtrl, { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  viewDetailTO(to) {
    this.navCtrl.push('TransferorderdetailPage', {
      tono: to.to_no,
      from: to.from_location,
      to: to.to_location,
      transferdate: to.transfer_date,
      status: to.status
    });
  }
  doPostingTO(to) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting  ' + to.to_no + ' ?',
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
            this.api.put("table/transfer_order",
              {
                "to_no": to.to_no,
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
  getTOList() {
    return new Promise(resolve => {
      let offsetprepare = 30 * this.halamantolist
      if (this.halamantolist == -1) {
        resolve();
      }
      else {
        this.halamantolist++;
        this.api.get('table/transfer_order', {
          params: {
            limit: 30, offset: offsetprepare, filter: "status='INPG'"
          }
        })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.transferorderlist.push(data[i]);
              this.totaldatatolist = val['count'];
              this.searchtolist = this.transferorderlist;
            }
            if (data.length == 0) {
              this.halamantolist = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchTOList(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.transferorderlist = this.searchto.filter(tolist => {
        return tolist.to_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.transferorderlist = this.searchtolist;
    }
  }
  doInfiniteTOList(infiniteScroll) {
    this.getTOList().then(response => {
      infiniteScroll.complete();

    })
  }
  doRefreshTOList(refresher) {
    this.api.get("table/transfer_order", { params: { limit: 30, filter: "status='INPG'" } }).subscribe(val => {
      this.transferorderlist = val['data'];
      this.totaldatatolist = val['count'];
      this.searchtolist = this.transferorderlist;
      refresher.complete();
    });
  }
  doSortTOList(filter) {
    if (this.sortTOList == 'ASC') {
      this.sortTOList = 'DESC'
    }
    else {
      this.sortTOList = 'ASC'
    }
    this.api.get("table/transfer_order", { params: { filter: "status='INPG'", sort: filter + " " + this.sortTOList + " " } }).subscribe(val => {
      this.transferorderlist = val['data'];
      this.totaldatatolist = val['count'];
      this.filter = filter
    });
  }
  viewDetailTOList(tolist) {
    this.navCtrl.push('TransferorderdetailPage', {
      tono: tolist.to_no,
      locationcode: tolist.location_code,
      transferdate: tolist.transfer_date,
      status: tolist.status
    });
  }
  doPostingTOList(tolist) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting  ' + tolist.to_no + ' ?',
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
            this.api.put("table/transfer_order",
              {
                "to_no": tolist.to_no,
                "status": 'CLS1'
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
  getTOReceiving() {
    return new Promise(resolve => {
      let offsetprepare = 30 * this.halamantoreceiving
      if (this.halamantoreceiving == -1) {
        resolve();
      }
      else {
        this.halamantoreceiving++;
        this.api.get('table/transfer_order', {
          params: {
            limit: 30, offset: offsetprepare, filter: "status='CLS1'"
          }
        })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.transferorderreceiving.push(data[i]);
              this.totaldatatoreceiving = val['count'];
              this.searchtoreceiving = this.transferorderreceiving;
            }
            if (data.length == 0) {
              this.halamantoreceiving = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchTOReceiving(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.transferorderreceiving = this.searchto.filter(toreceiving => {
        return toreceiving.to_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.transferorderreceiving = this.searchtoreceiving;
    }
  }
  doInfiniteTOReceiving(infiniteScroll) {
    this.getTOReceiving().then(response => {
      infiniteScroll.complete();

    })
  }
  doRefreshTOReceiving(refresher) {
    this.api.get("table/transfer_order", { params: { limit: 30, filter: "status='CLS1'" } }).subscribe(val => {
      this.transferorderreceiving = val['data'];
      this.totaldatatoreceiving = val['count'];
      this.searchtoreceiving = this.transferorderreceiving;
      refresher.complete();
    });
  }
  doSortTOReceiving(filter) {
    if (this.sortTOReceiving == 'ASC') {
      this.sortTOReceiving = 'DESC'
    }
    else {
      this.sortTOReceiving = 'ASC'
    }
    this.api.get("table/transfer_order", { params: { filter: "status='CLS1'", sort: filter + " " + this.sortTOReceiving + " " } }).subscribe(val => {
      this.transferorderreceiving = val['data'];
      this.totaldatatoreceiving = val['count'];
      this.filter = filter
    });
  }
  viewDetailTOReceiving(tolist) {
    this.navCtrl.push('TransferorderdetailPage', {
      tono: tolist.to_no,
      locationcode: tolist.location_code,
      transferdate: tolist.transfer_date,
      status: tolist.status
    });
  }
  doPostingTOReceiving(tolist) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting  ' + tolist.to_no + ' ?',
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
            this.api.put("table/transfer_order",
              {
                "to_no": tolist.to_no,
                "status": 'CLSD'
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
    this.myFormModalPic.reset()
  }
  doOpenToPIC(tolist) {
    this.getUsers();
    this.getInfoPIC(tolist)
    document.getElementById("myModalPic").style.display = "block";
    this.receiptno = tolist.to_no
  }
  getInfoPIC(tolist) {
    this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + tolist.to_no + "'" } })
      .subscribe(val => {
        this.pickingrelease = val['data'];
        console.log(this.pickingrelease)
        if (this.pickingrelease.length == 0) {
        }
        else if (this.pickingrelease.length != 0) {
          if (this.pickingrelease[0].status == 'OPEN') {
            this.myFormModalPic.get('pic').setValue(this.pickingrelease[0].pic);
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
        "pic": this.myFormModalPic.value.pic,
        "status": 'OPEN',
        "uuid": this.uuid
      },
      { headers })
      .subscribe(
        (val) => {
          document.getElementById("myModalPic").style.display = "none";
          this.myFormModalPic.reset()
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
        });
  }
  doSendNotificationPic(tolist) {
    this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + tolist.to_no + "'" } })
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
                        "receipt_no": tolist.to_no,
                        "receipt_date": tolist.transfer_date,
                        "expected_receipt_date": tolist.transfer_date,
                        "store_no": tolist.from_location,
                        "so_no": '',
                        "status": 'INP1'
                      },
                      { headers })
                      .subscribe(val => {
                        this.api.get("table/transfer_order_detail", { params: { filter: "to_no=" + "'" + tolist.to_no + "'" } })
                          .subscribe(val => {
                            let data = val['data'];
                            for (let i = 0; i < data.length; i++) {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              let uuid = UUID.UUID();
                              this.uuid = uuid;
                              this.api.post("table/picking_list_detail",
                                {
                                  "id": data[i].to_no + data[i].line_no,
                                  "receipt_no": data[i].to_no,
                                  "item_no": data[i].item_no,
                                  "description": data[i].description,
                                  "qty": data[i].qty,
                                  "sent_by": data[i].location_previous_code,
                                  "sjl_from": data[i].location_current_code,
                                  "UOM": data[i].unit,
                                  "retail_so_no": '',
                                  "status": 'OPEN',
                                  "uuid": this.uuid
                                },
                                { headers })
                                .subscribe(val => {
                                  this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Item", filter: "[No_]=" + "'" + data[i].item_no + "'" } }).subscribe(val => {
                                    let dataitem = val['data']
                                    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Production BOM Line", filter: "[Production BOM No_]=" + "'" + dataitem[0]["Production BOM No_"] + "'" } }).subscribe(val => {
                                      let datapart = val['data']
                                      for (let j = 0; j < datapart.length; j++) {
                                        this.api.post("table/picking_list_detail_part",
                                          {
                                            "id": data[i].to_no + data[i].line_no,
                                            "receipt_no": data[i].to_no,
                                            "item_no": data[i].item_no,
                                            "bom_no": datapart[j]["Production BOM No_"],
                                            "part_no": datapart[j].No_,
                                            "line_no": datapart[j]["Line No_"],
                                            "description": datapart[j].Description,
                                            "qty": datapart[j].Quantity,
                                            "location": '81003',
                                            "sub_location": '',
                                            "UOM": datapart[j]["Unit of Measure Code"],
                                            "retail_so_no": '',
                                            "status": 'OPEN',
                                            "uuid": UUID.UUID()
                                          },
                                          { headers })
                                          .subscribe(val => {

                                          });
                                      }
                                    });
                                  })
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
  doPrint(tolist) {
    let locationModal = this.modalCtrl.create('PickingnotePage', {
      receiptno: tolist.to_no
    },
      { cssClass: "modal-fullscreen" });
    locationModal.present();
  }

}
