import { Component } from '@angular/core';
import { ActionSheetController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { FileChooser } from "@ionic-native/file-chooser";
import { FileOpener } from "@ionic-native/file-opener";
import { FilePath } from "@ionic-native/file-path";
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-purchasingorder',
  templateUrl: 'purchasingorder.html',
})
export class PurchasingorderPage {
  private purchasing_order = [];
  searchpo: any;
  searchpoaction: any;
  items = [];
  halaman = 0;
  totaldata: any;
  totaldataitem: any;
  public toggled: boolean = false;
  orderno = '';
  po: string = "purchasingorder";
  private width: number;
  private height: number;

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
    public actionSheetCtrl: ActionSheetController
  ) {
    this.getPO();
    this.toggled = false;
    this.po = "purchasingorder"
    platform.ready().then(() => {
      this.width = platform.width();
      this.height = platform.height();
    });
  }
  ionViewDidLoad() {
    console.log(this.width);
    console.log(this.height);
  }
  getPO() {
    return new Promise(resolve => {
      let offset = 30 * this.halaman
      console.log('offset', this.halaman);
      if (this.halaman == -1) {
        console.log('Data Tidak Ada')
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/purchasing_order', { params: { limit: 30, offset: offset, filter: "status='OPEN'" } })
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

  getSearchPO(ev: any) {
    console.log(ev)
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.purchasing_order = this.searchpo.filter(po => {
        return po.order_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.purchasing_order = this.searchpo;
    }
  }

  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };
  viewDetail(po) {
    this.navCtrl.push('DetailpoPage', {
      orderno: po.order_no,
      docno: po.doc_no,
      batchno: po.batch_no,
      locationcode: po.location_code,
      transferdate: po.transfer_date,
      totalitem: po.total_item,
      poid: po.po_id
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

  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }

  doUpdatePO(po) {
    let locationModal = this.modalCtrl.create('PurchasingorderupdatePage',
      {
        poid: po.po_id,
        docno: po.doc_no,
        orderno: po.order_no,
        vendorno: po.vendor_no,
        transferdate: po.transfer_date,
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
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");

            this.api.delete("table/purchasing_order", { params: { filter: 'po_id=' + "'" + po.po_id + "'" }, headers })
              .subscribe(
                (val) => {
                  console.log("DELETE call successful value returned in body",
                    val);
                  this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='OPEN'" } }).subscribe(val => {
                    this.purchasing_order = val['data'];
                    this.totaldata = val['count'];
                    this.searchpo = this.purchasing_order;
                  });
                },
                response => {
                  console.log("DELETE call in error", response);
                },
                () => {
                  console.log("The DELETE observable is now completed.");
                });
          }
        }
      ]
    });
    alert.present();
  }
  doRefresh(refresher) {
    this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='OPEN'" } }).subscribe(val => {
      this.purchasing_order = val['data'];
      this.totaldata = val['count'];
      this.searchpo = this.purchasing_order;
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
            console.log('Cancel clicked');
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
                "po_id": po.po_id,
                "posting_date": date,
                "status": 'INP1',
                "user_id": ''
              },
              { headers })
              .subscribe(
                (val) => {
                  console.log("Posting call successful value returned in body",
                    val);
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Posting Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='OPEN'" } }).subscribe(val => {
                    this.purchasing_order = val['data'];
                    this.totaldata = val['count'];
                    this.searchpo = this.purchasing_order;
                  });

                },
                response => {
                  console.log("Posting call in error", response);
                },
                () => {
                  console.log("The Posting observable is now completed.");
                });
          }
        }
      ]
    });
    alert.present();
  }

  doFilter(filter) {
    this.api.get("table/purchasing_order", { params: { filter: "status='OPEN'", sort: filter } }).subscribe(val => {
      this.purchasing_order = val['data'];
      this.totaldata = val['count'];
      console.log(this.purchasing_order);
      console.log(this.totaldata);
    });
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
                    console.log('Cancel clicked');
                  }
                },
                {
                  text: 'Posting',
                  handler: () => {
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");

                    this.api.put("table/purchasing_order",
                      {
                        "po_id": po.po_id,
                        "status": 'INP1',
                        "user_id": ''
                      },
                      { headers })
                      .subscribe(
                        (val) => {
                          console.log("Posting call successful value returned in body",
                            val);
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Posting Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                          this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='OPEN'" } }).subscribe(val => {
                            this.purchasing_order = val['data'];
                            this.totaldata = val['count'];
                            this.searchpo = this.purchasing_order;
                          });

                        },
                        response => {
                          console.log("Posting call in error", response);
                        },
                        () => {
                          console.log("The Posting observable is now completed.");
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
                poid: po.po_id,
                docno: po.doc_no,
                orderno: po.order_no,
                vendorno: po.vendor_no,
                transferdate: po.transfer_date,
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
                    console.log('Cancel clicked');
                  }
                },
                {
                  text: 'Delete',
                  handler: () => {
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");

                    this.api.delete("table/purchasing_order", { params: { filter: 'po_id=' + "'" + po.po_id + "'" }, headers })
                      .subscribe(
                        (val) => {
                          console.log("DELETE call successful value returned in body",
                            val);
                          this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='OPEN'" } }).subscribe(val => {
                            this.purchasing_order = val['data'];
                            this.totaldata = val['count'];
                            this.searchpo = this.purchasing_order;
                          });
                        },
                        response => {
                          console.log("DELETE call in error", response);
                        },
                        () => {
                          console.log("The DELETE observable is now completed.");
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
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

}