import { Component } from '@angular/core';
import { ModalController, MenuController, IonicPage, LoadingController, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-qcindetail',
  templateUrl: 'qcindetail.html',
})
export class QcindetailPage {
  private quality_control = [];
  private qcresult = [];
  private qcparameter = [];
  private nextnoqcresult = [];
  private nextnoqcresultparam = [];
  private qcresultparameter = [];
  private qcin = [];
  private receiving = [];
  private qcresultdesc = [];
  searchqc: any;
  halaman = 0;
  totaldata: any;
  totaldataqcresult: any;
  public toggled: boolean = false;
  qc: string = "qcin";
  button: string = "qcin";
  orderno = '';
  itemno = '';
  batchno = '';
  data = {};
  option: BarcodeScannerOptions;
  public buttonText: string;
  private uuid = '';
  public loading: boolean;
  private photos = [];
  private totalphoto: any;
  imageURI: string = '';
  imageFileName: string = '';
  public detailqc: boolean = false;
  private qclist = '';
  public functionality: boolean = false;
  public productstyle: boolean = false;
  public datameasurement: boolean = false;
  public packaging: boolean = false;
  public shippingmark: boolean = false;
  public param = '';
  public noqcresult: any;
  public uuidresult: any;
  public noqcresultparam: any;
  public detailinspection = '';
  private nextnoqc = '';
  private token:any;

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
    private transfer: FileTransfer,
    private camera: Camera,
    public loadingCtrl: LoadingController,
    public storage: Storage
  ) {
    this.orderno = navParams.get('orderno')
    this.batchno = navParams.get('batchno')
    this.itemno = navParams.get('itemno')
    this.getQC();
    this.toggled = false;
    this.detailqc = false;
    this.functionality = false;
    this.productstyle = false;
    this.datameasurement = false;
    this.packaging = false;
    this.shippingmark = false;
    this.qc = "qcin"
    this.button = "qcin"
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
  getQC() {
    return new Promise(resolve => {
      let offsetinfopo = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/qc_in', { params: { limit: 30, offset: offsetinfopo, filter: 'order_no=' + "'" + this.orderno + "'" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.quality_control.push(data[i]);
              this.totaldata = val['count'];
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
  getSearchQCDetail(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.quality_control = this.searchqc.filter(qc => {
        return qc.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.quality_control = this.searchqc;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfinite(infiniteScroll) {
    this.getQC().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }

  doRefresh(refresher) {
    this.api.get('table/qc_in', { params: { limit: 30, filter: 'order_no=' + "'" + this.orderno + "'" } })
      .subscribe(val => {
        this.quality_control = val['data'];
        this.totaldata = val['count'];
        this.searchqc = this.quality_control;
        refresher.complete();
      });
  }
  ionViewDidLoad() {
  }
  doPassed(qcparam) {
    let alert = this.alertCtrl.create({
      subTitle: 'Do you want to Passed this item?',
      inputs: [
        {
          name: 'description',
          placeholder: 'Description'
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
          text: 'Passed',
          handler: data => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");

            this.api.put("table/qc_in_result",
              {
                "qc_result_no": qcparam.qc_result_no,
                "qc_status": 'PASSED',
                "qc_description": data.description
              },
              { headers })
              .subscribe(
                (val) => {
                  this.presentToast("Save Successfully");
                  this.doOffChecking();
                });
          }
        }
      ]
    });
    alert.present();
  }
  doReject(qcparam) {
    let alert = this.alertCtrl.create({
      subTitle: 'Do you want to Reject this item?',
      inputs: [
        {
          name: 'description',
          placeholder: 'Description'
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
          text: 'Reject',
          handler: data => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");

            this.api.put("table/qc_in_result",
              {
                "qc_result_no": qcparam.qc_result_no,
                "qc_status": 'REJECT',
                "qc_description": data.description
              },
              { headers })
              .subscribe(
                (val) => {
                  this.presentToast("Save Successfully");
                  this.doOffChecking();
                });
          }
        }
      ]
    });
    alert.present();
  }
  doUpdateChecked(result) {
    this.api.get("table/qc_in_result_parameter", { params: { filter: "qc_result_no=" + "'" + result.qc_result_no + "'" } }).subscribe(val => {
      this.qcparameter = val['data'];
      this.api.get("table/qc_in_result", { params: { filter: "qc_result_no=" + "'" + result.qc_result_no + "'" } }).subscribe(val => {
        this.qcresultparameter = val['data'];
        this.noqcresultparam = result.qc_result_param_no
        this.noqcresult = result.qc_result_no
        this.uuidresult = result.uuid
        document.getElementById("myQCChecking").style.display = "block";
        document.getElementById("myHeader").style.display = "none";
        this.button = "qccheck"
      });
    })
  }
  doChecked() {
    let alert = this.alertCtrl.create({
      title: 'Please Input Barcode Number',
      inputs: [
        {
          name: 'item',
          placeholder: 'Barcode',
          value: ''
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
            this.api.get("table/receiving", {
              params: {
                filter:
                  'order_no=' + "'" + this.orderno + "'" + " AND " +
                  'batch_no=' + "'" + this.batchno + "'" + " AND " +
                  'item_no=' + "RIGHT('" + data.item + "',8)"
              }
            }).subscribe(val => {
              this.receiving = val['data'];
              if (this.receiving.length) {

                this.api.get("table/qc_in", {
                  params: {
                    filter:
                      'order_no=' + "'" + this.orderno + "'" + " AND " +
                      'batch_no=' + "'" + this.batchno + "'" + " AND " +
                      'item_no=' + "RIGHT('" + data.item + "',8)"
                  }
                }).subscribe(val => {
                  this.qcin = val['data'];
                  if (this.qcin.length == 0) {

                    this.getNextNoQC().subscribe(val => {
                      this.nextnoqc = val['nextno'];
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");

                      this.api.post("table/qc_in",
                        {
                          "qc_no": this.nextnoqc,
                          "order_no": this.orderno,
                          "batch_no": this.batchno,
                          "item_no": this.receiving[0].item_no,
                          "pic": '',
                          "qty": 20,
                          "qty_checked": 0,
                          "unit": this.receiving[0].unit,
                          "qc_status": 'Waiting Checking',
                          "status": 'OPEN',
                          "chronology_no": '',
                          "uuid": UUID.UUID()
                        },
                        { headers })
                        .subscribe();
                    });
                  }
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
                        "qc_no": this.nextnoqc,
                        "batch_no": this.batchno,
                        "item_no": this.receiving[0].item_no,
                        "date_start": date,
                        "date_finish": date,
                        "time_start": time,
                        "time_finish": time,
                        "qc_pic": 'AJI',
                        "qty_receiving": 25,
                        "unit": this.receiving[0].unit,
                        "qc_status": "OPEN",
                        "qc_description": "",
                        "uuid": uuid
                      },
                      { headers })
                      .subscribe(val => {
                        this.getNextNoQCResultParam().subscribe(val => {
                          this.nextnoqcresultparam = val['nextno'];
                          const headers = new HttpHeaders()
                            .set("Content-Type", "application/json");
                          this.api.post("table/qc_in_result_parameter",
                            {
                              "qc_result_param_no": this.nextnoqcresultparam,
                              "qc_result_no": this.nextnoqcresult,
                              "qc_param_id": '01',
                              "qc_param_desc": 'Appearance / Functionality',
                              "icon": 'md-construct',
                              "uuid": UUID.UUID()
                            },
                            { headers })
                            .subscribe(val => {
                              this.getNextNoQCResultParam().subscribe(val => {
                                this.nextnoqcresultparam = val['nextno'];
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.post("table/qc_in_result_parameter",
                                  {
                                    "qc_result_param_no": this.nextnoqcresultparam,
                                    "qc_result_no": this.nextnoqcresult,
                                    "qc_param_id": '02',
                                    "qc_param_desc": 'Product Style and Color',
                                    "icon": 'md-color-fill',
                                    "uuid": UUID.UUID()
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.getNextNoQCResultParam().subscribe(val => {
                                      this.nextnoqcresultparam = val['nextno'];
                                      const headers = new HttpHeaders()
                                        .set("Content-Type", "application/json");
                                      this.api.post("table/qc_in_result_parameter",
                                        {
                                          "qc_result_param_no": this.nextnoqcresultparam,
                                          "qc_result_no": this.nextnoqcresult,
                                          "qc_param_id": '03',
                                          "qc_param_desc": 'Data Measurement',
                                          "icon": 'md-contract',
                                          "uuid": UUID.UUID()
                                        },
                                        { headers })
                                        .subscribe(val => {
                                          this.getNextNoQCResultParam().subscribe(val => {
                                            this.nextnoqcresultparam = val['nextno'];
                                            const headers = new HttpHeaders()
                                              .set("Content-Type", "application/json");
                                            this.api.post("table/qc_in_result_parameter",
                                              {
                                                "qc_result_param_no": this.nextnoqcresultparam,
                                                "qc_result_no": this.nextnoqcresult,
                                                "qc_param_id": '04',
                                                "qc_param_desc": 'Packaging',
                                                "icon": 'md-cube',
                                                "uuid": UUID.UUID()
                                              },
                                              { headers })
                                              .subscribe(val => {
                                                this.getNextNoQCResultParam().subscribe(val => {
                                                  this.nextnoqcresultparam = val['nextno'];
                                                  const headers = new HttpHeaders()
                                                    .set("Content-Type", "application/json");
                                                  this.api.post("table/qc_in_result_parameter",
                                                    {
                                                      "qc_result_param_no": this.nextnoqcresultparam,
                                                      "qc_result_no": this.nextnoqcresult,
                                                      "qc_param_id": '05',
                                                      "qc_param_desc": 'Shipping mark',
                                                      "icon": 'md-boat',
                                                      "uuid": UUID.UUID()
                                                    },
                                                    { headers })
                                                    .subscribe(val => {
                                                      this.api.get("table/qc_in_result_parameter", { params: { filter: "qc_result_no=" + "'" + this.nextnoqcresult + "'" } }).subscribe(val => {
                                                        this.qcparameter = val['data'];
                                                        this.noqcresult = this.nextnoqcresult;
                                                        this.uuidresult = uuid
                                                        document.getElementById("myQCChecking").style.display = "block";
                                                        document.getElementById("myHeader").style.display = "none";
                                                        this.button = "qccheck"
                                                      })
                                                    });
                                                });
                                              });
                                          });
                                        });
                                    });
                                  });
                              });
                            });

                        });
                      });
                  });

                });
              }
              else {
                let alert = this.alertCtrl.create({
                  title: 'Error',
                  subTitle: 'Data not found',
                  buttons: ['OK']
                });
                alert.present();
              }
            });
          }
        }
      ]
    });
    alert.present();
  }
  doOffChecking() {
    this.functionality = false;
    this.api.get("table/qc_in_result"/*, { params: { filter: 'qc_no=' + "'" + this.quality_control[0].qc_no + "'" } }*/).subscribe(val => {
      this.qcresult = val['data'];
      this.totaldataqcresult = val['count'];
      document.getElementById("myQCChecking").style.display = "none";
      document.getElementById("myHeader").style.display = "block";
      this.button = "qcin"
    });
  }
  doDetailQC(qc) {
    this.qcresult = [];
    this.qclist = qc.item_no;
    this.detailqc = this.detailqc ? false : true;
    this.getQCResult(qc);
  }
  getfoto() {
    this.api.get("table/link_image", { params: { filter: 'parent=' + "'" + this.qcparameter[0].uuid + "'" } }).subscribe(val => {
      this.photos = val['data'];
      this.totalphoto = val['count'];
    });
  }
  doCamera(qcparam) {
    let options: CameraOptions = {
      quality: 100,
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
              "parent": qcparam.uuid,
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
                this.api.get("table/link_image", { params: { filter: 'parent=' + "'" + qcparam.uuid + "'" } }).subscribe(val => {
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
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {

    });

    toast.present();
  }
  getQCResult(qc) {
    return new Promise(resolve => {
      this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + qc.qc_no + "'" } }).subscribe(val => {
        this.qcresult = val['data'];
        this.totaldataqcresult = val['count'];
        resolve();
      })
    });
  }
  doOpenContent(qcparam, noqcresult, uuidresult) {
    this.api.get("table/qc_in_result", { params: { filter: 'qc_result_no=' + "'" + noqcresult + "'" } }).subscribe(val => {
      this.qcresult = val['data'];
      this.totaldataqcresult = val['count'];
      this.param = qcparam.qc_param_desc
      this.functionality = this.functionality ? false : true;
      this.api.get("table/qc_in_result_parameter", { params: { filter: "qc_result_param_no=" + "'" + qcparam.qc_result_param_no + "'" } }).subscribe(val => {
        this.qcresultdesc = val['data'];
        this.detailinspection = this.qcresultdesc[0].qc_result_desc;
      });
    });
  }
  doSaveQCDesc(qcparam) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.put("table/qc_in_result_parameter",
      {
        "qc_result_param_no": qcparam.qc_result_param_no,
        "qc_result_desc": this.detailinspection
      },
      { headers })
      .subscribe(
        (val) => {
          this.presentToast("Save Successfully");
          this.functionality = this.functionality ? false : true;
          this.api.get("table/qc_in_result_parameter", { params: { filter: "qc_result_no=" + "'" + qcparam.qc_result_no + "'" } }).subscribe(val => {
            this.qcparameter = val['data'];
            this.detailinspection = '';
          });
        });
  }
  getNextNoQC() {
    return this.api.get('nextno/qc_in/qc_no')
  }
  getNextNoQCResult() {
    return this.api.get('nextno/qc_in_result/qc_result_no')
  }
  getNextNoQCResultParam() {
    return this.api.get('nextno/qc_in_result_parameter/qc_result_param_no')
  }
}