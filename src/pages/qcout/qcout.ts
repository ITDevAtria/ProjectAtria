import { Component } from '@angular/core';
import { ModalController, MenuController, IonicPage, LoadingController, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";;
import { Storage } from '@ionic/storage';

declare var cordova;

@IonicPage()
@Component({
  selector: 'page-qcout',
  templateUrl: 'qcout.html',
})
export class QcoutPage {
  private trans_sales_entry = [];
  private quality_control = [];
  private quality_control_clsd = [];
  private qcresult = [];
  private qcresultclsd = [];
  private qcresultopen = [];
  private qcoutpic = [];
  private qcoutbarcode = [];
  private photos = [];
  searchstaging: any;
  searchqc: any;
  searchqcclsd: any;
  halaman = 0;
  totaldata: any;
  totaldataqc: any;
  totaldataqcclsd: any;
  totaldataqcresult: any;
  totaldataqcresultclsd: any;
  totaldataqcresultopen: any;
  totalphoto: any;
  public toggled: boolean = false;
  qc: string = "qcout";
  private nextnoqc = '';
  private nextnoqcresult = '';
  public detailqc: boolean = false;
  public button: boolean = false;
  private qclist = '';
  private batchnolist = '';
  private qclistclsd = '';
  private batchnolistclsd = '';
  option: BarcodeScannerOptions;
  imageURI: string = '';
  imageFileName: string = '';
  private uuid = '';
  private uuidqcresult = '';
  private qcno = '';
  private qcnoresult = '';
  private viewfoto = '';
  private qcqty = '';
  private token: any;
  public role = [];
  public roleid = '';
  public userid: any;

  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public menu: MenuController,
    public modalCtrl: ModalController,
    private transfer: FileTransfer,
    private camera: Camera,
    public loadingCtrl: LoadingController,
    public storage: Storage
  ) {
    this.getTranssales();
    this.toggled = false;
    this.qc = "qcout"
    this.detailqc = false;
    this.button = false;
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/qc_out', { params: { limit: 30, filter: "status='OPEN' AND pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.quality_control = val['data']
      });
    this.api.get('table/qc_out', { params: { limit: 30, filter: "status='CLSD' AND pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.quality_control_clsd = val['data']
        this.searchqcclsd = this.quality_control_clsd
      });
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          this.roleid = this.role[0].id_group
        })
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
  getTranssales() {
    return new Promise(resolve => {
      let offsetstagingin = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/trans_sales_entry', { params: { limit: 30, offset: offsetstagingin, filter: "status_qc='0'" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.trans_sales_entry.push(data[i]);
              this.totaldata = val['count'];
              this.searchstaging = this.trans_sales_entry;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }
  getStagingqc() {
    return new Promise(resolve => {
      let offsetqc = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/qc_out', { params: { limit: 30, offset: offsetqc, filter: "status='OPEN' AND pic=" + "'" + this.userid + "'" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.quality_control.push(data[i]);
              this.totaldataqc = val['count'];
              this.searchqc = this.quality_control;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }
  getStagingqcclsd() {
    return new Promise(resolve => {
      let offsetqc = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/qc_out', { params: { limit: 30, offset: offsetqc, filter: "status='CLSD' AND pic=" + "'" + this.userid + "'", group: 'receipt_no' } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.quality_control_clsd.push(data[i]);
              this.totaldataqcclsd = val['count'];
              this.searchqcclsd = this.quality_control_clsd;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchStagingDetail(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.trans_sales_entry = this.searchstaging.filter(qc => {
        return qc.order_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.trans_sales_entry = this.searchstaging;
    }
  }
  getSearchQCclsd(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.quality_control_clsd = this.searchqcclsd.filter(qc => {
        return qc.receipt_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.quality_control_clsd = this.searchqcclsd;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfiniteStaging(infiniteScroll) {
    this.getTranssales().then(response => {
      infiniteScroll.complete();

    })
  }
  doInfiniteQC(infiniteScroll) {
    this.getStagingqc().then(response => {
      infiniteScroll.complete();

    })
  }
  doInfiniteQCclsd(infiniteScroll) {
    this.getStagingqcclsd().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }
  doRefreshStaging(refresher) {
    this.api.get('table/trans_sales_entry', { params: { limit: 30, filter: "status_qc='0'" } })
      .subscribe(val => {
        this.trans_sales_entry = val['data'];
        this.totaldata = val['count'];
        this.searchstaging = this.trans_sales_entry;
        refresher.complete();
      });
  }
  doRefreshmyqc(refresher) {
    this.api.get('table/qc_out', { params: { limit: 30, filter: "status='OPEN'" } })
      .subscribe(val => {
        this.quality_control = val['data'];
        this.totaldataqc = val['count'];
        this.searchqc = this.quality_control;
        refresher.complete();
      });
  }
  doRefreshmyqcclsd(refresher) {
    this.api.get('table/qc_out', { params: { limit: 30, filter: "status='CLSD'" } })
      .subscribe(val => {
        this.quality_control_clsd = val['data'];
        this.totaldataqcclsd = val['count'];
        this.searchqcclsd = this.quality_control_clsd;
        refresher.complete();
      });
  }
  ionViewDidLoad() {
  }
  viewDetail(myqc) {
    this.navCtrl.push('QcoutdetailPage', {
      qcno: myqc.qc_no,
      receivingno: myqc.receipt_no,
      orderno: myqc.order_no,
      batchno: myqc.batch_no,
      itemno: myqc.item_no,
      pic: myqc.pic,
      qty: myqc.qty,
      staging: myqc.staging
    });
  }
  doDetailQC(myqc) {
    this.qcresult = [];
    this.qclist = myqc.item_no;
    this.batchnolist = myqc.batch_no;
    this.qcqty = myqc.qty
    this.detailqc = this.detailqc ? false : true;
    this.getQCResult(myqc);
  }
  doDetailQCclsd(myqc) {
    this.qcresultclsd = [];
    this.qclistclsd = myqc.item_no;
    this.batchnolistclsd = myqc.batch_no;
    this.qcqty = myqc.qty
    this.detailqc = this.detailqc ? false : true;
    this.getQCResultclsd(myqc);
  }
  getQCResult(myqc) {
    return new Promise(resolve => {
      this.api.get("table/qc_out_result", { params: { limit: 1000, filter: 'qc_no=' + "'" + myqc.qc_no + "'" } }).subscribe(val => {
        this.qcresult = val['data'];
        this.totaldataqcresult = val['count'];
        resolve();
      })
    });
  }
  getQCResultclsd(myqc) {
    return new Promise(resolve => {
      this.api.get("table/qc_out_result", { params: { limit: 1000, filter: 'receipt_no=' + "'" + myqc.receipt_no + "'" } }).subscribe(val => {
        this.qcresultclsd = val['data'];
        this.totaldataqcresultclsd = val['count'];
        resolve();
      })
    });
  }
  doChecked() {
    /*cordova.plugins.pm80scanner.scan(result => {*/
    let alert = this.alertCtrl.create({
      title: 'Input Barcode Number',
      inputs: [
        {
          name: 'barcodeno',
          placeholder: 'Barcode Number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: data => {
            var barcodeno = data.barcodeno;
            var batchno = barcodeno.substring(0, 6);
            var itemno = barcodeno.substring(6, 14);
            this.api.get('table/qc_out', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + " AND " + "item_no=" + "'" + itemno + "'" + " AND " + "status='OPEN'" } })
              .subscribe(val => {
                this.qcoutbarcode = val['data'];
                if (this.qcoutbarcode.length == 0) {
                  let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Data Not Found In My QC',
                    buttons: ['OK']
                  });
                  alert.present();
                }
                else {
                  this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcoutbarcode[0].qc_no + "'" } }).subscribe(val => {
                    this.qcresult = val['data'];
                    this.totaldataqcresult = val['count'];
                    if (this.qcoutbarcode.length == 0) {
                      let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'Data Not Found In My QC',
                        buttons: ['OK']
                      });
                      alert.present();
                    }
                    else if (this.totaldataqcresult == this.qcoutbarcode[0].qty) {
                      let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'Data Already Create',
                        buttons: ['OK']
                      });
                      alert.present();
                    }
                    else {
                      let alert = this.alertCtrl.create({
                        title: 'Confirm Start',
                        message: 'Do you want to QC Now?',
                        buttons: [
                          {
                            text: 'Cancel',
                            role: 'cancel',
                            handler: () => {
                            }
                          },
                          {
                            text: 'Start',
                            handler: () => {
                              this.getNextNoQCResult().subscribe(val => {
                                let time = moment().format('HH:mm:ss');
                                let date = moment().format('YYYY-MM-DD');
                                let uuid = UUID.UUID();
                                this.nextnoqcresult = val['nextno'];
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.post("table/qc_out_result",
                                  {
                                    "qc_result_no": this.nextnoqcresult,
                                    "qc_no": this.qcoutbarcode[0].qc_no,
                                    "receipt_no": this.qcoutbarcode[0].receipt_no,
                                    "batch_no": this.qcoutbarcode[0].batch_no,
                                    "item_no": this.qcoutbarcode[0].item_no,
                                    "date_start": date,
                                    "date_finish": date,
                                    "time_start": time,
                                    "time_finish": time,
                                    "qc_pic": this.qcoutbarcode[0].pic,
                                    "qty_receiving": this.qcoutbarcode[0].qty,
                                    "unit": this.qcoutbarcode[0].unit,
                                    "qc_status": "OPEN",
                                    "qc_description": "",
                                    "uuid": uuid
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    document.getElementById("myQCChecking").style.display = "block";
                                    document.getElementById("myBTNChecking").style.display = "block";
                                    document.getElementById("myHeader").style.display = "none";
                                    this.button = true;
                                    this.uuidqcresult = uuid;
                                    this.qcnoresult = this.nextnoqcresult;
                                    this.qcno = this.qcoutbarcode[0].qc_no
                                    this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + this.uuidqcresult + "'" } }).subscribe(val => {
                                      this.photos = val['data'];
                                      this.totalphoto = val['count'];
                                    });
                                  })
                              });
                            }
                          }
                        ]
                      });
                      alert.present();
                    }
                  });
                }

              });
          }
        }
      ]
    });
    alert.present();
    /*});*/
  }
  doOffChecking() {
    document.getElementById("myQCChecking").style.display = "none";
    document.getElementById("myBTNChecking").style.display = "none";
    document.getElementById("button").style.display = "block";
    document.getElementById("myHeader").style.display = "block";
    this.button = false;
  }
  getfoto(result) {
    this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'" } }).subscribe(val => {
      this.photos = val['data'];
      this.totalphoto = val['count'];
      this.uuidqcresult = result.uuid;
      this.qcnoresult = result.qc_result_no;
      this.qcno = result.qc_no;
      if (result.qc_status == 'OPEN') {
        document.getElementById("myQCChecking").style.display = "block";
        document.getElementById("myBTNChecking").style.display = "block";
        document.getElementById("button").style.display = "block";
        document.getElementById("myHeader").style.display = "none";
        this.button = true;
      }
      else {
        document.getElementById("myQCChecking").style.display = "block";
        document.getElementById("myBTNChecking").style.display = "none";
        document.getElementById("button").style.display = "none";
        document.getElementById("myHeader").style.display = "none";
      }
    });
  }
  doViewPhoto(foto) {
    this.viewfoto = foto.img_src
    document.getElementById("foto").style.display = "block";
  }
  doCloseViewPhoto() {
    document.getElementById("foto").style.display = "none";
  }
  doCamera() {
    let options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI
    }
    options.sourceType = this.camera.PictureSourceType.CAMERA

    this.camera.getPicture(options).then((imageData) => {
      this.imageURI = imageData;
      this.imageFileName = this.imageURI;
      if (this.imageURI == '') return;
      let loader = this.loadingCtrl.create({
        content: "Uploading..."
      });
      loader.present();
      const fileTransfer: FileTransferObject = this.transfer.create();

      let uuid = UUID.UUID();
      this.uuid = uuid;
      let options: FileUploadOptions = {
        fileKey: 'fileToUpload',
        //fileName: this.imageURI.substr(this.imageURI.lastIndexOf('/') + 1),
        fileName: uuid + '.jpeg',
        chunkedMode: true,
        mimeType: "image/jpeg",
        headers: {}
      }

      let url = "http://10.10.10.7/serverapi/api/Upload";
      fileTransfer.upload(this.imageURI, url, options)
        .then((data) => {
          loader.dismiss();
          const headers = new HttpHeaders()
            .set("Content-Type", "application/json");

          this.api.post("table/link_image",
            {
              "no": this.uuid,
              "parent": this.uuidqcresult,
              "table_name": "Qc_out_result",
              "img_src": 'http://101.255.60.202/serverapi/img/' + this.uuid,
              "file_name": this.uuid,
              "description": "",
              "latitude": "",
              "longitude": "",
              "location_code": '',
              "upload_date": "",
              "upload_by": ""
            },
            { headers })
            .subscribe(
              (val) => {
                this.presentToast("Image uploaded successfully");
                this.api.get("table/link_image", { params: { filter: 'parent=' + "'" + this.uuidqcresult + "'" } }).subscribe(val => {
                  this.photos = val['data'];
                  this.totalphoto = val['count'];
                });
              });
          this.imageURI = '';
          this.imageFileName = '';
        }, (err) => {
          loader.dismiss();
          this.presentToast(err);
        });
    }, (err) => {
      this.presentToast(err);
    });
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
    });

    toast.present();
  }
  getNextNoQCResult() {
    return this.api.get('nextno/qc_out_result/qc_result_no')
  }
  doPassedQC() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Passed',
      message: 'Do you want to Passed this Item?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Passed',
          handler: () => {
            let alert = this.alertCtrl.create({
              title: 'Description',
              inputs: [
                {
                  name: 'description',
                  placeholder: 'Description'
                }
              ],
              buttons: [
                {
                  text: 'SAVE',
                  handler: data => {
                    this.getNextNoQCResult().subscribe(val => {
                      let time = moment().format('HH:mm:ss');
                      let date = moment().format('YYYY-MM-DD');
                      let uuid = UUID.UUID();
                      this.nextnoqcresult = val['nextno'];
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/qc_out_result",
                        {
                          "qc_result_no": this.qcnoresult,
                          "date_finish": date,
                          "time_finish": time,
                          "qc_status": "PASSED",
                          "qc_description": data.description
                        },
                        { headers })
                        .subscribe(val => {
                          document.getElementById("myQCChecking").style.display = "none";
                          document.getElementById("myBTNChecking").style.display = "none";
                          document.getElementById("myHeader").style.display = "block";
                          this.button = false;
                          this.qcnoresult = '';
                          this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                            this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" + " AND " + "qc_status='OPEN'" } }).subscribe(val => {
                              this.qcresultopen = val['data'];
                              this.totaldataqcresultopen = val['count'];
                              console.log(this.totaldataqcresult, this.qcqty)
                              if ((this.totaldataqcresult == this.qcqty) && this.totaldataqcresultopen == 0) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.put("table/qc_out",
                                  {
                                    "qc_no": this.qcno,
                                    "date_start": this.qcresult[0].date_start,
                                    "date_finish": this.qcresult[0].date_finish,
                                    "time_start": this.qcresult[0].time_start,
                                    "time_finish": this.qcresult[0].time_finish,
                                    "status": 'CLSD'
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/qc_out', { params: { limit: 30, filter: "status='OPEN'" } })
                                      .subscribe(val => {
                                        this.quality_control = val['data'];
                                        this.totaldataqc = val['count'];
                                      });
                                  });
                              }
                            });
                          });
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                        })
                    });
                  }
                }
              ]
            });
            alert.present();
          }
        }
      ]
    });
    alert.present();
  }
  doRejectQC() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Reject',
      message: 'Do you want to Reject this Item?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Reject',
          handler: () => {
            let alert = this.alertCtrl.create({
              title: 'Description',
              inputs: [
                {
                  name: 'description',
                  placeholder: 'Description'
                }
              ],
              buttons: [
                {
                  text: 'SAVE',
                  handler: data => {
                    this.getNextNoQCResult().subscribe(val => {
                      let time = moment().format('HH:mm:ss');
                      let date = moment().format('YYYY-MM-DD');
                      let uuid = UUID.UUID();
                      this.nextnoqcresult = val['nextno'];
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/qc_out_result",
                        {
                          "qc_result_no": this.qcnoresult,
                          "date_finish": date,
                          "time_finish": time,
                          "qc_status": "REJECT",
                          "qc_description": data.description
                        },
                        { headers })
                        .subscribe(val => {
                          document.getElementById("myQCChecking").style.display = "none";
                          document.getElementById("myBTNChecking").style.display = "none";
                          document.getElementById("myHeader").style.display = "block";
                          this.button = false;
                          this.qcnoresult = '';
                          this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                          });
                          this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                            this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" + " AND " + "qc_status='OPEN'" } }).subscribe(val => {
                              this.qcresultopen = val['data'];
                              this.totaldataqcresultopen = val['count'];
                              if ((this.totaldataqcresult == this.qcqty) && this.totaldataqcresultopen == 0) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.put("table/qc_out",
                                  {
                                    "qc_no": this.qcno,
                                    "date_start": this.qcresult[0].date_start,
                                    "date_finish": this.qcresult[0].date_finish,
                                    "time_start": this.qcresult[0].time_start,
                                    "time_finish": this.qcresult[0].time_finish,
                                    "status": 'CLSD'
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/qc_out', { params: { limit: 30, filter: "status='OPEN'" } })
                                      .subscribe(val => {
                                        this.quality_control = val['data'];
                                        this.totaldataqc = val['count'];
                                      });
                                  });
                              }
                            });
                          });
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                        })
                    });
                  }
                }
              ]
            });
            alert.present();
          }
        }
      ]
    });
    alert.present();
  }
  doDetail(staging) {
    this.navCtrl.push('QcoutdetailPage', {
      receiptno: staging.receipt_no
    });
  }
  doMyQC(staging) {
    let alert = this.alertCtrl.create({
      subTitle: 'Yakin ingin memasukan no invoice ini ' + staging.receipt_no + ' ke MyQC ? ',
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
            this.api.get('nextno/qc_out/qc_no')
              .subscribe(val => {
                this.nextnoqc = val['nextno'];
                const headers = new HttpHeaders()
                  .set("Content-Type", "application/json");
                let date = moment().format('YYYY-MM-DD');
                this.api.post("table/qc_out",
                  {
                    "qc_no": this.nextnoqc,
                    "receipt_no": staging.receipt_no,
                    "batch_no": staging.batch_no,
                    "item_no": staging.item_no,
                    "pic": this.userid,
                    "qty": staging.qty,
                    "unit": staging.unit,
                    "staging": '',
                    "status": 'OPEN',
                    "uuid": UUID.UUID()
                  },
                  { headers })
                  .subscribe(val => {
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");
                    this.api.put("table/trans_sales_entry",
                      {
                        "trans_sales_id": staging.trans_sales_id,
                        "status_qc": '1'
                      },
                      { headers })
                      .subscribe(val => {
                        this.trans_sales_entry = [];
                        this.api.get('table/trans_sales_entry', { params: { limit: 30, filter: "status_qc='0'" } })
                          .subscribe(val => {
                            this.trans_sales_entry = val['data']
                          });
                        this.api.get('table/qc_out', { params: { limit: 30, filter: "status='OPEN'" } })
                          .subscribe(val => {
                            this.quality_control = val['data']
                          });
                      });
                  });
              });
          }
        }
      ]
    });
    alert.present();
  }
}