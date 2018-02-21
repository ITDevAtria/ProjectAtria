import { Component } from '@angular/core';
import { ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-receivingdetail',
  templateUrl: 'receivingdetail.html',
})
export class ReceivingdetailPage {
  private receiving = [];
  searchrcv: any;
  items = [];
  halaman = 0;
  totaldata: any;
  public toggled: boolean = false;
  docno = '';
  orderno = '';
  batchno = '';
  locationcode = '';
  transferdate = '';
  detailrcv: string = "detailreceiving";
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
    this.getRCV();
    this.toggled = false;
    this.detailrcv = "detailreceiving";
    this.docno = navParams.get('docno');
    this.orderno = navParams.get('orderno');
    this.batchno = navParams.get('batchno');
    this.locationcode = navParams.get('locationcode');
    this.transferdate = navParams.get('transferdate');
  }
  getRCV(){
    this.api.get("table/receiving", { params: { filter: 'order_no=' + "'" + this.orderno + "'" } }).subscribe(val => {
      this.receiving = val['data'];
      this.totaldata = val['count'];
    })
  }
  getRCVDetail() {
    return new Promise(resolve => {
      let offset = 30 * this.halaman
      console.log('offset', this.halaman);
      if (this.halaman == -1) {
        console.log('Data Tidak Ada')
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/receiving', { params: { limit: 30, offset: offset, filter: 'order_no=' + "'" + this.orderno + "'" }})
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
    })

  }
  getSearchRCV(ev: any) {
    console.log(ev)
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.receiving = this.searchrcv.filter(detailrcv => {
        return detailrcv.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.receiving = this.searchrcv;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfinite(infiniteScroll) {
    this.getRCVDetail().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }

  doRefresh(refresher) {
    this.api.get("table/receiving", { params: { limit: 30, filter: 'order_no=' + "'" + this.orderno + "'" }}).subscribe(val => {
      this.receiving = val['data'];
      this.totaldata = val['count'];
      this.searchrcv = this.receiving;
      refresher.complete();
    });
  }
  doPostRCV(detailrcv){
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Are you sure you want to posting  ' + detailrcv.item_no + ' ?',
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

            this.api.put("table/receiving",
              {
                "receiving_no": detailrcv.receiving_no,
                "status": '3'
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
                  this.api.get("table/receiving", { params: { filter: 'order_no=' + "'" + this.orderno + "'" } }).subscribe(val => {
                    this.receiving = val['data'];
                    this.totaldata = val['count'];
                    this.searchrcv = this.receiving;
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
  doViewRCV(detailrcv){
    let locationModal = this.modalCtrl.create('ReceivingdetailviewPage', 
    {
      detailno: detailrcv.receiving_no,
      docno: detailrcv.doc_no,
      orderno: detailrcv.order_no,
      itemno: detailrcv.item_no,
      qty: detailrcv.qty,
      receivingpic: detailrcv.receiving_pic,
      locationplan: detailrcv.position 
    },
    { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  doUpdateRCV(detailrcv){
    let locationModal = this.modalCtrl.create('ReceivingdetailupdatePage', 
    {
      detailno: detailrcv.receiving_no,
      docno: detailrcv.doc_no,
      orderno: detailrcv.order_no,
      itemno: detailrcv.item_no,
      qty: detailrcv.qty,
      staging: detailrcv.staging,
      description: detailrcv.receiving_description,
      receivingpic: detailrcv.receiving_pic,
      locationplan: detailrcv.position 
    },
    { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  ionViewDidLoad() {
    this.getRCVDetail();
  }
}