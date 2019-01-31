import { Component } from '@angular/core';
import { Events, LoadingController, ActionSheetController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import moment from 'moment';
import { UUID } from 'angular2-uuid';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-transferorderdetail',
  templateUrl: 'transferorderdetail.html',
})
export class TransferorderdetailPage {
  myFormModal: FormGroup;
  myFormModalPic: FormGroup;
  halamantodetail = 0;
  searchtodetail: any;
  private transferorderdetail = [];
  private location_master = [];
  private division = [];
  totaldatatodetail: any;
  detailto: string;
  public tono: any;
  public from: any;
  public to: any;
  public transferdate: any;
  public status: any;
  private receivingchecked = [];
  totaldatachecked: any;
  checked = '';
  selisihqty: any;
  public transferorder = [];
  public nextnostaging: any;
  searchloc: any;
  divisioncode = '';
  setdiv = '';
  divdesc = '';
  receivingno = '';
  public rolecab: any;
  public userid: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public platform: Platform,
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    private http: HttpClient,
    public alertCtrl: AlertController) {
    this.myFormModal = formBuilder.group({
      location: ['', Validators.compose([Validators.required])],
    })
    this.myFormModalPic = formBuilder.group({
      pic: ['', Validators.compose([Validators.required])],
    })
    this.detailto = 'detailtoitem'
    this.userid = this.navParams.get('userid')
    this.rolecab = this.navParams.get('rolecab')
    this.tono = this.navParams.get('tono')
    this.from = this.navParams.get('from')
    this.to = this.navParams.get('to')
    this.transferdate = this.navParams.get('transferdate')
    this.status = this.navParams.get('status')
    this.getRCVChecked();
    this.getTODetail();
  }
  doAddTODetail(detailtoitem) {
    this.navCtrl.push('TransferorderdetailaddPage', {
      tono: this.tono,
      from: this.from,
      to: this.to,
      transferdate: this.transferdate,
      rolecab: this.rolecab,
      userid: this.userid
    });
  }
  getTODetail() {
    return new Promise(resolve => {
      let offsetprepare = 30 * this.halamantodetail
      if (this.halamantodetail == -1) {
        resolve();
      }
      else {
        this.halamantodetail++;
        this.api.get('table/transfer_order_detail', {
          params: {
            limit: 30, offset: offsetprepare, filter: "status='OPEN' AND to_no=" + "'" + this.tono + "'"
          }
        })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.transferorderdetail.push(data[i]);
              this.totaldatatodetail = val['count'];
              this.searchtodetail = this.transferorderdetail;
            }
            if (data.length == 0) {
              this.halamantodetail = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchTODetail(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.transferorderdetail = this.searchtodetail.filter(todetail => {
        return todetail.to_detail_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.transferorderdetail = this.searchtodetail;
    }
  }
  getRCVChecked() {
    return new Promise(resolve => {
      this.api.get("table/transfer_order_detail", { params: { filter: 'to_no=' + "'" + this.tono + "'" + ' AND ' + "status= 'CHECKED'" } }).subscribe(val => {
        this.receivingchecked = val['data'];
        this.totaldatachecked = val['count'];
        if (this.receivingchecked.length) {
          this.checked = this.receivingchecked[0].item_no
          this.selisihqty = this.receivingchecked[0].qty - this.receivingchecked[0].qty_receiving
        }
        resolve();
      })
    });
  }
  doInfiniteTODetail(infiniteScroll) {
    this.getTODetail().then(response => {
      infiniteScroll.complete();

    })
  }
  doRefreshTODetail(refresher) {
    this.api.get("table/transfer_order_detail", { params: { limit: 30, filter: "status='OPEN' AND to_no=" + "'" + this.tono + "'" } }).subscribe(val => {
      this.transferorderdetail = val['data'];
      this.totaldatatodetail = val['count'];
      this.searchtodetail = this.transferorderdetail;
      refresher.complete();
    });
  }
  doReceiving(detailto) {
    let alert = this.alertCtrl.create({
      title: detailto.item_no,
      inputs: [
        {
          name: 'qty',
          placeholder: 'Qty',
          value: '1'
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
            console.log(detailto.to_detail_no)
            if ((parseInt(detailto.qty_receiving) + parseInt(data.qty)) > detailto.qty) {
              let alert = this.alertCtrl.create({
                title: 'Error',
                message: 'Total QTY Receiving greater than QTY',
                buttons: ['OK']
              });
              alert.present();
            }
            else {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.put("table/transfer_order_detail",
                {
                  "to_detail_no": detailto.to_detail_no,
                  "qty_receiving": parseInt(detailto.qty_receiving) + parseInt(data.qty)
                },
                { headers })
                .subscribe(val => {
                  this.api.get("table/transfer_order_detail", { params: { limit: 30, filter: "status='OPEN' AND to_no=" + "'" + this.tono + "'" } }).subscribe(val => {
                    this.transferorderdetail = val['data'];
                    this.getRCVChecked();
                  });
                  if ((parseInt(detailto.qty_receiving) + parseInt(data.qty)) == detailto.qty) {
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");
                    this.api.put("table/transfer_order_detail",
                      {
                        "to_detail_no": detailto.to_detail_no,
                        "status": 'CHECKED'
                      },
                      { headers })
                      .subscribe(val => {
                        this.api.get("table/transfer_order_detail", { params: { limit: 30, filter: "status='OPEN' AND to_no=" + "'" + this.tono + "'" } }).subscribe(val => {
                          this.transferorderdetail = val['data'];
                        });
                        this.getRCVChecked();
                      });
                  }
                  this.api.get("table/transfer_order_detail", { params: { limit: 30, filter: "status='OPEN' AND to_no=" + "'" + this.tono + "'" } }).subscribe(val => {
                    this.transferorderdetail = val['data'];
                  });
                });
              alert.present();
            }
          }
        }
      ]
    });
    alert.present();
  }
  doSubmitRCV(cek) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to Submit  ' + cek.item_no + ' ?',
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

            this.api.put("table/transfer_order_detail",
              {
                "to_detail_no": cek.to_detail_no,
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
                  this.getRCVChecked();
                },
                response => {

                },
                () => {

                });
            this.getNextNoStaging().subscribe(val => {
              this.nextnostaging = val['nextno'];
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              let date = moment().format('YYYY-MM-DD');
              this.api.post("table/staging_out",
                {
                  "staging_no": this.nextnostaging,
                  "order_no": cek.to_detail_no,
                  "batch_no": cek.batch_no,
                  "item_no": cek.item_no,
                  "data_entry": date,
                  "qty": cek.qty,
                  "qty_qc": cek.qty,
                  "unit": cek.unit,
                  "staging": cek.staging,
                  "uuid": UUID.UUID()
                },
                { headers })
                .subscribe();
            });
            if (this.totaldatachecked == 1) {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");

              this.api.put("table/transfer_order",
                {
                  "to_no": this.tono,
                  "status": 'CLSD'
                },
                { headers })
                .subscribe();
            }
          }
        }
      ]
    });
    alert.present();
  }
  getNextNoStaging() {
    return this.api.get('nextno/staging_out/staging_no')
  }
  doOpenStaging(cek) {
    if (cek.staging != '') {
      this.myFormModal.get('location').setValue(cek.staging)
      this.receivingno = cek.to_detail_no
      document.getElementById("myModal").style.display = "block";
    }
    else {
      this.myFormModal.reset();
      this.receivingno = cek.to_detail_no
      document.getElementById("myModal").style.display = "block";
    }
  }
  doOffStaging() {
    this.myFormModal.reset();
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
  doSetLoc(div) {
    this.setdiv = div.code;
  }
  doLocation() {
    this.api.get('table/location_master', { params: { limit: 1000, filter: 'division=' + "'" + this.setdiv + "'" } }).subscribe(val => {
      this.location_master = val['data'];
      this.searchloc = this.location_master;
    });
  }
  doOffLocations() {
    document.getElementById("myLocations").style.display = "none";
    document.getElementById("myHeader").style.display = "block";
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
  doSaveStaging() {
    console.log(this.receivingno)
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.put("table/transfer_order_detail",
      {
        "to_detail_no": this.receivingno,
        "staging": this.myFormModal.value.location
      },
      { headers })
      .subscribe(
        (val) => {
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Save Sukses',
            buttons: ['OK']
          });
          this.getRCVChecked();
          this.doOffStaging();
        })
  }
}
