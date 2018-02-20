import { Component } from '@angular/core';
import { ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-detailpo',
  templateUrl: 'detailpo.html',
})
export class DetailpoPage {
  private purchasing_order_detail = [];
  searchpodetail: any;
  items = [];
  halaman = 0;
  totaldata: any;
  public toggled: boolean = false;
  orderno = '';
  docno = ''
  batchno = '';
  locationcode = '';
  transferdate = '';
  poid = '';
  totalitem: any;
  detailpo: string = "detailpoitem";
  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public menu: MenuController,
    public modalCtrl: ModalController
  ) {
    this.getPOD();
    this.toggled = false;
    this.detailpo = "detailpoitem"
    this.docno = navParams.get('docno');
    this.orderno = navParams.get('orderno');
    this.batchno = navParams.get('batchno');
    this.locationcode = navParams.get('locationcode');
    this.transferdate = navParams.get('transferdate');
    this.totalitem = navParams.get('totalitem');
    this.poid = navParams.get('poid');
  }
  getPOD() {
    this.api.get("table/purchasing_order_detail", { params: { filter: 'order_no=' + "'" + this.orderno + "'" } }).subscribe(val => {
      this.purchasing_order_detail = val['data'];
      this.totaldata = val['count'];
    })
  }
  getPODetail() {
    return new Promise(resolve => {
      let offset = 30 * this.halaman
      console.log('offset', this.halaman);
      if (this.halaman == -1) {
        console.log('Data Tidak Ada')
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/purchasing_order_detail', { params: { limit: 30, offset: offset, filter: 'order_no=' + "'" + this.orderno + "'" } })
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
    console.log(ev)
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
  doAddPODetail(docno, orderno, batchno, locationcode, transferdate, totalitem, poid, totaldata) {
    let locationModal = this.modalCtrl.create('DetailpoaddPage',
      {
        docno: docno,
        orderno: orderno,
        batchno: batchno,
        locationcode: locationcode,
        transferdate: transferdate,
        totalitem: totalitem,
        poid: poid,
        totalcount: totaldata
      },
      { cssClass: "modal-fullscreen" });
    locationModal.present();
  }

  doInfinite(infiniteScroll) {
    this.getPODetail().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }
  doUpdatePODetail(detailpo) {
    let locationModal = this.modalCtrl.create('DetailpoupdatePage',
      {
        detailno: detailpo.po_detail_no,
        docno: detailpo.doc_no,
        orderno: detailpo.order_no,
        itemno: detailpo.item_no,
        qty: detailpo.qty,
        unit: detailpo.unit
      },
      { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  doDeletePODetail(detailpo) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete  ' + detailpo.order_no + ' ?',
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

            this.api.delete("table/purchasing_order_detail", { params: { filter: 'po_detail_no=' + "'" + detailpo.po_detail_no + "'" }, headers })
              .subscribe(
                (val) => {
                  console.log("DELETE call successful value returned in body",
                    val);
                  this.api.delete("table/receiving", { params: { filter: 'receiving_no=' + "'" + detailpo.po_detail_no + "'" }, headers })
                    .subscribe();
                  this.api.put("table/purchasing_order",
                    {
                      "po_id": this.poid,
                      "total_item": this.totaldata - 1
                    },
                    { headers })
                    .subscribe();
                  this.api.get("table/purchasing_order_detail", { params: { limit: 30, filter: 'order_no=' + "'" + this.orderno + "'" } }).subscribe(val => {
                    this.purchasing_order_detail = val['data'];
                    this.totaldata = val['count'];
                    this.searchpodetail = this.purchasing_order_detail;
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
    this.api.get("table/purchasing_order_detail", { params: { filter: 'order_no=' + "'" + this.orderno + "'" } }).subscribe(val => {
      this.purchasing_order_detail = val['data'];
      this.totaldata = val['count'];
      this.searchpodetail = this.purchasing_order_detail;
      refresher.complete();
    });
  }
  ionViewDidLoad() {
    console.log(this.docno, this.orderno, this.batchno, this.locationcode, this.transferdate);
    this.getPODetail();
  }
}