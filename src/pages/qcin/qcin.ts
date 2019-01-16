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
  selector: 'page-qcin',
  templateUrl: 'qcin.html',
})
export class QcinPage {
  private staging_in = [];
  private quality_control = [];
  private qcresult = [];
  private qcresultopen = [];
  private qcinpic = [];
  private qcinbarcode = [];
  private photos = [];
  searchstaging: any;
  searchqc: any;
  halaman = 0;
  totaldata: any;
  totaldataqc: any;
  totaldataqcresult: any;
  totaldataqcresultopen: any;
  totalphoto: any;
  public toggled: boolean = false;
  qc: string = "qcin";
  private nextnoqc = '';
  private nextnoqcresult = '';
  public detailqc: boolean = false;
  public button: boolean = false;
  private qclist = '';
  private batchnolist = '';
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
  public name: any;

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
    this.getStagingin();
    this.toggled = false;
    this.qc = "qcin"
    this.detailqc = false;
    this.button = false;
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.api.get('table/qc_in', { params: { limit: 30, filter: "pic='12345'" + " AND " + "status='OPEN'" } })
      .subscribe(val => {
        this.quality_control = val['data'];
        this.totaldataqc = val['count'];
        this.searchqc = this.quality_control;
      });
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
  getStagingin() {
    return new Promise(resolve => {
      let offsetstagingin = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/staging_in', { params: { limit: 30, offset: offsetstagingin, filter: "qty_qc!=0" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.staging_in.push(data[i]);
              this.totaldata = val['count'];
              this.searchstaging = this.staging_in;
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
        this.api.get('table/qc_in', { params: { limit: 30, offset: offsetqc, filter: "pic='12345'" + " AND " + "status='OPEN'" } })
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
  getSearchStagingDetail(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.staging_in = this.searchstaging.filter(qc => {
        return qc.order_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.staging_in = this.searchstaging;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfiniteStaging(infiniteScroll) {
    this.getStagingin().then(response => {
      infiniteScroll.complete();

    })
  }
  doInfiniteQC(infiniteScroll) {
    this.getStagingqc().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }
  doRefreshStaging(refresher) {
    this.api.get('table/staging_in', { params: { limit: 30, filter: "qty_qc!=0" } })
      .subscribe(val => {
        this.staging_in = val['data'];
        this.totaldata = val['count'];
        this.searchstaging = this.staging_in;
        refresher.complete();
      });
  }
  doRefreshmyqc(refresher) {
    this.api.get('table/qc_in', { params: { limit: 30, filter: "pic='12345'" + " AND " + "status='OPEN'" } })
      .subscribe(val => {
        this.quality_control = val['data'];
        this.totaldataqc = val['count'];
        this.searchqc = this.quality_control;
        refresher.complete();
      });
  }
  ionViewDidLoad() {
  }
  viewDetail(myqc) {
    this.navCtrl.push('QcindetailPage', {
      qcno: myqc.qc_no,
      receivingno: myqc.receiving_no,
      orderno: myqc.order_no,
      batchno: myqc.batch_no,
      itemno: myqc.item_no,
      pic: myqc.pic,
      qty: myqc.qty,
      staging: myqc.staging
    });
  }
  doOpenQty(staging) {
    let alert = this.alertCtrl.create({
      title: staging.item_no,
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
            this.api.get('table/qc_in', { params: { limit: 30, filter: "pic='12345'" + " AND " + "batch_no=" + "'" + staging.batch_no + "'" + " AND " + "item_no=" + "'" + staging.item_no + "'" } })
              .subscribe(val => {
                this.qcinpic = val['data'];
                if (this.qcinpic.length == 0) {
                  this.api.get('nextno/qc_in/qc_no')
                    .subscribe(val => {
                      this.nextnoqc = val['nextno'];
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      let date = moment().format('YYYY-MM-DD');
                      this.api.post("table/qc_in",
                        {
                          "qc_no": this.nextnoqc,
                          "receiving_no": staging.receiving_no,
                          "doc_no": staging.doc_no,
                          "order_no": staging.order_no,
                          "batch_no": staging.batch_no,
                          "item_no": staging.item_no,
                          "pic": '12345',
                          "qty": data.qty,
                          "unit": staging.unit,
                          "staging": staging.staging,
                          "status": 'OPEN',
                          "uuid": UUID.UUID()
                        },
                        { headers })
                        .subscribe(val => {
                          const headers = new HttpHeaders()
                            .set("Content-Type", "application/json");
                          this.api.put("table/staging_in",
                            {
                              "staging_no": staging.staging_no,
                              "qty_qc": staging.qty_qc - data.qty
                            },
                            { headers })
                            .subscribe(val => {
                              this.api.get('table/staging_in', { params: { filter: "qty_qc!=0" } })
                                .subscribe(val => {
                                  this.staging_in = val['data'];
                                  this.totaldata = val['count'];
                                  this.searchstaging = this.staging_in;
                                  this.api.get('table/qc_in', { params: { limit: 30, filter: "pic='12345'" + " AND " + "status='OPEN'" } })
                                    .subscribe(val => {
                                      this.quality_control = val['data'];
                                      this.totaldataqc = val['count'];
                                      this.searchqc = this.quality_control;
                                    });
                                });

                            });
                        });
                    });
                }
                else {
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  let date = moment().format('YYYY-MM-DD');
                  this.api.put("table/qc_in",
                    {
                      "qc_no": this.qcinpic[0].qc_no,
                      "qty": parseInt(this.qcinpic[0].qty) + parseInt(data.qty)
                    },
                    { headers })
                    .subscribe(val => {
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/staging_in",
                        {
                          "staging_no": staging.staging_no,
                          "qty_qc": staging.qty_qc - data.qty
                        },
                        { headers })
                        .subscribe(val => {
                          this.api.get('table/staging_in', { params: { filter: "qty_qc!=0" } })
                            .subscribe(val => {
                              this.staging_in = val['data'];
                              this.totaldata = val['count'];
                              this.searchstaging = this.staging_in;
                              this.api.get('table/qc_in', { params: { limit: 30, filter: "pic='12345'" } })
                                .subscribe(val => {
                                  this.quality_control = val['data'];
                                  this.totaldataqc = val['count'];
                                  this.searchqc = this.quality_control;
                                });
                            });

                        });
                    });
                }
              });
          }
        }
      ]
    });
    alert.present();
  }
  doDetailQC(myqc) {
    this.qcresult = [];
    this.qclist = myqc.item_no;
    this.batchnolist = myqc.batch_no;
    this.qcqty = myqc.qty
    this.detailqc = this.detailqc ? false : true;
    this.getQCResult(myqc);
  }
  getQCResult(myqc) {
    return new Promise(resolve => {
      this.api.get("table/qc_in_result", { params: { limit: 1000, filter: 'qc_no=' + "'" + myqc.qc_no + "'" } }).subscribe(val => {
        this.qcresult = val['data'];
        this.totaldataqcresult = val['count'];
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
            this.api.get('table/qc_in', { params: { limit: 30, filter: "pic='12345'" + " AND " + "batch_no=" + "'" + batchno + "'" + " AND " + "item_no=" + "'" + itemno + "'" + " AND " + "status='OPEN'" } })
              .subscribe(val => {
                this.qcinbarcode = val['data'];
                if (this.qcinbarcode.length == 0) {
                  let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Data Not Found In My QC',
                    buttons: ['OK']
                  });
                  alert.present();
                }
                else {
                  this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcinbarcode[0].qc_no + "'" } }).subscribe(val => {
                    this.qcresult = val['data'];
                    this.totaldataqcresult = val['count'];
                    if (this.qcinbarcode.length == 0) {
                      let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'Data Not Found In My QC',
                        buttons: ['OK']
                      });
                      alert.present();
                    }
                    else if (this.totaldataqcresult == this.qcinbarcode[0].qty) {
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
                                this.api.post("table/qc_in_result",
                                  {
                                    "qc_result_no": this.nextnoqcresult,
                                    "qc_no": this.qcinbarcode[0].qc_no,
                                    "batch_no": this.qcinbarcode[0].batch_no,
                                    "item_no": this.qcinbarcode[0].item_no,
                                    "date_start": date,
                                    "date_finish": date,
                                    "time_start": time,
                                    "time_finish": time,
                                    "qc_pic": 'AJI',
                                    "qty_receiving": 25,
                                    "unit": this.qcinbarcode[0].unit,
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
                                    this.qcno = this.qcinbarcode[0].qc_no
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

      let url = "http://101.255.60.202/pictureapi/api/Upload";
      fileTransfer.upload(this.imageURI, url, options)
        .then((data) => {
          loader.dismiss();
          const headers = new HttpHeaders()
            .set("Content-Type", "application/json");

          this.api.post("table/link_image",
            {
              "no": this.uuid,
              "parent": this.uuidqcresult,
              "table_name": "Qc_in_result",
              "img_src": 'http://101.255.60.202/pictureapi/img/' + this.uuid,
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
    return this.api.get('nextno/qc_in_result/qc_result_no')
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
                      this.api.put("table/qc_in_result",
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
                          this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                            this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" + " AND " + "qc_status='OPEN'" } }).subscribe(val => {
                              this.qcresultopen = val['data'];
                              this.totaldataqcresultopen = val['count'];
                              if ((this.totaldataqcresult == this.qcqty) && this.totaldataqcresultopen == 0) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.put("table/qc_in",
                                  {
                                    "qc_no": this.qcno,
                                    "date_start" : this.qcresult[0].date_start,
                                    "date_finish" : this.qcresult[0].date_finish,
                                    "time_start" : this.qcresult[0].time_start,
                                    "time_finish" : this.qcresult[0].time_finish,
                                    "status": 'CLSD'
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/qc_in', { params: { limit: 30, filter: "pic='12345'" + " AND " + "status='OPEN'" } })
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
                      this.api.put("table/qc_in_result",
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
                          this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                          });
                          this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                            this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" + " AND " + "qc_status='OPEN'" } }).subscribe(val => {
                              this.qcresultopen = val['data'];
                              this.totaldataqcresultopen = val['count'];
                              if ((this.totaldataqcresult == this.qcqty) && this.totaldataqcresultopen == 0) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.put("table/qc_in",
                                  {
                                    "qc_no": this.qcno,
                                    "date_start" : this.qcresult[0].date_start,
                                    "date_finish" : this.qcresult[0].date_finish,
                                    "time_start" : this.qcresult[0].time_start,
                                    "time_finish" : this.qcresult[0].time_finish,
                                    "status": 'CLSD'
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/qc_in', { params: { limit: 30, filter: "pic='12345'" + " AND " + "status='OPEN'" } })
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
}