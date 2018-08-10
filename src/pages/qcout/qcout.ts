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
import { ImageViewerController } from 'ionic-img-viewer';

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
  searchdatadm: any;
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
  public detailqcclsd: boolean = false;
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
  public datadm = [];
  public dataqc = [];
  public totaldatadatadm: any;
  public qcstatus: any;
  public loader: any;
  public receiptno: any;
  public itemno: any;
  public param: any;
  public parent: any;
  public photosview = [];
  public paramdesc: any;
  public description: any;
  public datadmsearch = [];
  public totaldatadatadmsearch: any;
  public searchdata: any;
  public dataqcsearch = [];
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
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading...'
    });
    this.loader.present()
    this.getDataDMSearch();
    this.getDataDM();
    this.toggled = false;
    this.qc = "qcout"
    this.detailqc = false;
    this.detailqcclsd = false;
    this.button = false;
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/qc_out', { params: { limit: 30, filter: "status='OPEN'" } })
        .subscribe(val => {
          this.quality_control = val['data']
        });
      this.api.get('table/qc_out', { params: { limit: 30, filter: "status='CLSD'" } })
        .subscribe(val => {
          this.quality_control_clsd = val['data']
          this.searchqcclsd = this.quality_control_clsd
        });
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          this.roleid = this.role[0].id_group
          console.log(this.roleid)
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
  doProfile() {
    this.navCtrl.push('UseraccountPage');
  }
  getDataDMSearch() {
    this.api.get("tablenav", { params: { limit: 10000, table: "CSB_LIVE$Delivery Management Header", filter: "Status=0 AND [Expected Receipt Date] > '2018-01-01'", sort: "[Expected Receipt Date]" + " DESC " } })
    .subscribe(val => {
      let data = val['data'];
      for (let i = 0; i < data.length; i++) {
        this.api.get('table/qc_out', { params: { limit: 10000, filter: "receipt_no=" + "'" + data[i]["Receipt No_"] + "'" } })
          .subscribe(val => {
            this.dataqcsearch = val['data'];
            if (this.dataqcsearch.length == 0) {
              this.datadmsearch.push(data[i]);
              this.totaldatadatadmsearch = val['count'];
              this.searchdatadm = this.datadmsearch;
            }
            else if (this.dataqcsearch.length) {

            }
          });
      }
    });
  }
  getDataDM() {
    return new Promise(resolve => {
      let offsetpicking = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Header", filter: "Status=0 AND [Expected Receipt Date] > '2018-01-01'", offset: offsetpicking, sort: "[Expected Receipt Date]" + " DESC " } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.api.get('table/qc_out', { params: { limit: 30, filter: "receipt_no=" + "'" + data[i]["Receipt No_"] + "'" } })
                .subscribe(val => {
                  this.dataqc = val['data'];
                  if (this.dataqc.length == 0) {
                    this.datadm.push(data[i]);
                    this.totaldatadatadm = val['count'];
                    this.searchdata = this.datadm
                  }
                  else if (this.dataqc.length) {

                  }
                });
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            this.loader.dismiss()
            resolve();
          });
      }
    });
  }
  // getTranssales() {
  //   return new Promise(resolve => {
  //     let offsetstagingin = 30 * this.halaman
  //     if (this.halaman == -1) {
  //       resolve();
  //     }
  //     else {
  //       this.halaman++;
  //       this.api.get('table/trans_sales_entry', { params: { limit: 30, offset: offsetstagingin, filter: "status_qc='0'" } })
  //         .subscribe(val => {
  //           let data = val['data'];
  //           for (let i = 0; i < data.length; i++) {
  //             this.trans_sales_entry.push(data[i]);
  //             this.totaldata = val['count'];
  //             this.searchdatadm = this.trans_sales_entry;
  //           }
  //           if (data.length == 0) {
  //             this.halaman = -1
  //           }
  //           resolve();
  //         });
  //     }
  //   })

  // }
  getStagingqc() {
    return new Promise(resolve => {
      let offsetqc = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/qc_out', { params: { limit: 30, offset: offsetqc, filter: "status='OPEN'" } })
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
        this.api.get('table/qc_out', { params: { limit: 30, offset: offsetqc, filter: "status='CLSD'", group: 'receipt_no' } })
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
  getsearchdatadmDetail(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.datadm = this.searchdatadm.filter(dm => {
        return dm["Receipt No_"].toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.datadm = this.searchdata;
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

  doInfiniteDM(infiniteScroll) {
    this.getDataDM().then(response => {
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
  doRefreshDM(refresher) {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Header", filter: "Status=0 AND [Expected Receipt Date] > '2018-01-01'", sort: "[Expected Receipt Date]" + " DESC " } })
      .subscribe(val => {
        let data = val['data'];
        for (let i = 0; i < data.length; i++) {
          this.api.get('table/qc_out', { params: { limit: 30, filter: "receipt_no=" + "'" + data[i]["Receipt No_"] + "'" } })
            .subscribe(val => {
              this.dataqc = val['data'];
              if (this.dataqc.length == 0) {
                this.datadm.push(data[i]);
                this.totaldatadatadm = val['count'];
                this.searchdatadm = this.datadm;
                refresher.complete()
              }
              else if (this.dataqc.length) {

              }
            });
        }
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
    this.qclist = myqc.qc_no;
    this.qcqty = myqc.qty
    this.detailqc = this.detailqc ? false : true;
    this.getQCResult(myqc);
  }
  doDetailQCclsd(myqc) {
    this.qcresultclsd = [];
    this.qclistclsd = myqc.qc_no;
    this.qcqty = myqc.qty
    this.detailqcclsd = this.detailqcclsd ? false : true;
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
                                    this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + this.uuidqcresult + "'", sort: "param" + " ASC " } }).subscribe(val => {
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
    // document.getElementById("button").style.display = "block";
    document.getElementById("myHeader").style.display = "block";
    this.button = false;
    this.qcresultclsd = [];
    this.api.get("table/qc_out_result", { params: { limit: 1000, filter: 'receipt_no=' + "'" + this.receiptno + "'" } }).subscribe(val => {
      this.qcresultclsd = val['data'];
      this.totaldataqcresultclsd = val['count'];
    });
    this.qcresult = [];
    this.api.get("table/qc_out_result", { params: { limit: 1000, filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
      this.qcresult = val['data'];
      this.totaldataqcresult = val['count'];
    });
  }
  getfoto(result) {
    if (this.roleid == 'ADMIN') {
      this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'", sort: "param" + " ASC " } })
        .subscribe(val => {
          this.photos = val['data'];
          this.totalphoto = val['count'];
          this.uuidqcresult = result.uuid;
          this.qcnoresult = result.qc_result_no;
          this.qcno = result.qc_no;
          this.receiptno = result.receipt_no;
          this.itemno = result.item_no;
          this.qcstatus = result.qc_status
        });
    }
    else {
      if (result.time_start == '00:00:00') {
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
                let datetime = moment().format('YYYY-MM-DD HH:mm:ss');
                const headersa = new HttpHeaders()
                  .set("Content-Type", "application/json");

                this.api.post("table/link_image",
                  {
                    "no": UUID.UUID(),
                    "param": '01',
                    "param_desc": 'Tampak Kiri',
                    "parent": result.uuid,
                    "table_name": "Qc_out_result",
                    "img_src": '',
                    "file_name": '',
                    "description": '',
                    "latitude": "",
                    "longitude": "",
                    "location_code": '',
                    "upload_date": datetime,
                    "upload_by": ""
                  },
                  { headersa })
                  .subscribe(
                    (val) => {
                      this.api.post("table/link_image",
                        {
                          "no": UUID.UUID(),
                          "param": '02',
                          "param_desc": 'Tampak Kanan',
                          "parent": result.uuid,
                          "table_name": "Qc_out_result",
                          "img_src": '',
                          "file_name": '',
                          "description": '',
                          "latitude": "",
                          "longitude": "",
                          "location_code": '',
                          "upload_date": datetime,
                          "upload_by": ""
                        },
                        { headersa })
                        .subscribe(
                          (val) => {
                            this.api.post("table/link_image",
                              {
                                "no": UUID.UUID(),
                                "param": '03',
                                "param_desc": 'Tampak Atas',
                                "parent": result.uuid,
                                "table_name": "Qc_out_result",
                                "img_src": '',
                                "file_name": '',
                                "description": '',
                                "latitude": "",
                                "longitude": "",
                                "location_code": '',
                                "upload_date": datetime,
                                "upload_by": ""
                              },
                              { headersa })
                              .subscribe(
                                (val) => {
                                  this.api.post("table/link_image",
                                    {
                                      "no": UUID.UUID(),
                                      "param": '04',
                                      "param_desc": 'Tampak Bawah',
                                      "parent": result.uuid,
                                      "table_name": "Qc_out_result",
                                      "img_src": '',
                                      "file_name": '',
                                      "description": '',
                                      "latitude": "",
                                      "longitude": "",
                                      "location_code": '',
                                      "upload_date": datetime,
                                      "upload_by": ""
                                    },
                                    { headersa })
                                    .subscribe(
                                      (val) => {
                                        this.api.post("table/link_image",
                                          {
                                            "no": UUID.UUID(),
                                            "param": '05',
                                            "param_desc": 'Lainnya 1',
                                            "parent": result.uuid,
                                            "table_name": "Qc_out_result",
                                            "img_src": '',
                                            "file_name": '',
                                            "description": '',
                                            "latitude": "",
                                            "longitude": "",
                                            "location_code": '',
                                            "upload_date": datetime,
                                            "upload_by": ""
                                          },
                                          { headersa })
                                          .subscribe(
                                            (val) => {
                                              this.api.post("table/link_image",
                                                {
                                                  "no": UUID.UUID(),
                                                  "param": '06',
                                                  "param_desc": 'Lainnya 2',
                                                  "parent": result.uuid,
                                                  "table_name": "Qc_out_result",
                                                  "img_src": '',
                                                  "file_name": '',
                                                  "description": '',
                                                  "latitude": "",
                                                  "longitude": "",
                                                  "location_code": '',
                                                  "upload_date": datetime,
                                                  "upload_by": ""
                                                },
                                                { headersa })
                                                .subscribe(
                                                  (val) => {
                                                    this.api.post("table/link_image",
                                                      {
                                                        "no": UUID.UUID(),
                                                        "param": '07',
                                                        "param_desc": 'Lainnya 3',
                                                        "parent": result.uuid,
                                                        "table_name": "Qc_out_result",
                                                        "img_src": '',
                                                        "file_name": '',
                                                        "description": '',
                                                        "latitude": "",
                                                        "longitude": "",
                                                        "location_code": '',
                                                        "upload_date": datetime,
                                                        "upload_by": ""
                                                      },
                                                      { headersa })
                                                      .subscribe(
                                                        (val) => {
                                                          this.api.post("table/link_image",
                                                            {
                                                              "no": UUID.UUID(),
                                                              "param": '08',
                                                              "param_desc": 'Lainnya 4',
                                                              "parent": result.uuid,
                                                              "table_name": "Qc_out_result",
                                                              "img_src": '',
                                                              "file_name": '',
                                                              "description": '',
                                                              "latitude": "",
                                                              "longitude": "",
                                                              "location_code": '',
                                                              "upload_date": datetime,
                                                              "upload_by": ""
                                                            },
                                                            { headersa })
                                                            .subscribe(
                                                              (val) => {
                                                                this.api.post("table/link_image",
                                                                  {
                                                                    "no": UUID.UUID(),
                                                                    "param": '09',
                                                                    "param_desc": 'Lainnya 5',
                                                                    "parent": result.uuid,
                                                                    "table_name": "Qc_out_result",
                                                                    "img_src": '',
                                                                    "file_name": '',
                                                                    "description": '',
                                                                    "latitude": "",
                                                                    "longitude": "",
                                                                    "location_code": '',
                                                                    "upload_date": datetime,
                                                                    "upload_by": ""
                                                                  },
                                                                  { headersa })
                                                                  .subscribe(
                                                                    (val) => {
                                                                      let time = moment().format('HH:mm:ss');
                                                                      let date = moment().format('YYYY-MM-DD');
                                                                      let uuid = UUID.UUID();
                                                                      const headers = new HttpHeaders()
                                                                        .set("Content-Type", "application/json");
                                                                      this.api.put("table/qc_out_result",
                                                                        {
                                                                          "qc_result_no": result.qc_result_no,
                                                                          "date_start": date,
                                                                          "time_start": time,
                                                                        },
                                                                        { headers })
                                                                        .subscribe(val => {
                                                                        });
                                                                      this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'", sort: "param" + " ASC " } })
                                                                        .subscribe(val => {
                                                                          this.photos = val['data'];
                                                                          this.totalphoto = val['count'];
                                                                          this.uuidqcresult = result.uuid;
                                                                          this.qcnoresult = result.qc_result_no;
                                                                          this.qcno = result.qc_no;
                                                                          this.receiptno = result.receipt_no;
                                                                          this.itemno = result.item_no;
                                                                          this.qcstatus = result.qc_status
                                                                          if (result.qc_status != 'PASSED') {
                                                                            document.getElementById("myQCChecking").style.display = "block";
                                                                            document.getElementById("myBTNChecking").style.display = "block";
                                                                            // document.getElementById("button").style.display = "block";
                                                                            document.getElementById("myHeader").style.display = "none";
                                                                            this.button = true;
                                                                          }
                                                                          else {
                                                                            document.getElementById("myQCChecking").style.display = "block";
                                                                            document.getElementById("myBTNChecking").style.display = "none";
                                                                            // document.getElementById("button").style.display = "none";
                                                                            document.getElementById("myHeader").style.display = "none";
                                                                          }
                                                                        });
                                                                    }, err => {
                                                                      this.api.post("table/link_image",
                                                                        {
                                                                          "no": UUID.UUID(),
                                                                          "param": '09',
                                                                          "param_desc": 'Lainnya 5',
                                                                          "parent": result.uuid,
                                                                          "table_name": "Qc_out_result",
                                                                          "img_src": '',
                                                                          "file_name": '',
                                                                          "description": '',
                                                                          "latitude": "",
                                                                          "longitude": "",
                                                                          "location_code": '',
                                                                          "upload_date": datetime,
                                                                          "upload_by": ""
                                                                        },
                                                                        { headersa })
                                                                        .subscribe()
                                                                    });
                                                              }, err => {
                                                                this.api.post("table/link_image",
                                                                  {
                                                                    "no": UUID.UUID(),
                                                                    "param": '08',
                                                                    "param_desc": 'Lainnya 4',
                                                                    "parent": result.uuid,
                                                                    "table_name": "Qc_out_result",
                                                                    "img_src": '',
                                                                    "file_name": '',
                                                                    "description": '',
                                                                    "latitude": "",
                                                                    "longitude": "",
                                                                    "location_code": '',
                                                                    "upload_date": datetime,
                                                                    "upload_by": ""
                                                                  },
                                                                  { headersa })
                                                                  .subscribe()
                                                              });
                                                        }, err => {
                                                          this.api.post("table/link_image",
                                                            {
                                                              "no": UUID.UUID(),
                                                              "param": '07',
                                                              "param_desc": 'Lainnya 3',
                                                              "parent": result.uuid,
                                                              "table_name": "Qc_out_result",
                                                              "img_src": '',
                                                              "file_name": '',
                                                              "description": '',
                                                              "latitude": "",
                                                              "longitude": "",
                                                              "location_code": '',
                                                              "upload_date": datetime,
                                                              "upload_by": ""
                                                            },
                                                            { headersa })
                                                            .subscribe()
                                                        });
                                                  }, err => {
                                                    this.api.post("table/link_image",
                                                      {
                                                        "no": UUID.UUID(),
                                                        "param": '06',
                                                        "param_desc": 'Lainnya 2',
                                                        "parent": result.uuid,
                                                        "table_name": "Qc_out_result",
                                                        "img_src": '',
                                                        "file_name": '',
                                                        "description": '',
                                                        "latitude": "",
                                                        "longitude": "",
                                                        "location_code": '',
                                                        "upload_date": datetime,
                                                        "upload_by": ""
                                                      },
                                                      { headersa })
                                                      .subscribe()
                                                  });
                                            }, err => {
                                              this.api.post("table/link_image",
                                                {
                                                  "no": UUID.UUID(),
                                                  "param": '05',
                                                  "param_desc": 'Lainnya 1',
                                                  "parent": result.uuid,
                                                  "table_name": "Qc_out_result",
                                                  "img_src": '',
                                                  "file_name": '',
                                                  "description": '',
                                                  "latitude": "",
                                                  "longitude": "",
                                                  "location_code": '',
                                                  "upload_date": datetime,
                                                  "upload_by": ""
                                                },
                                                { headersa })
                                                .subscribe()
                                            });
                                      }, err => {
                                        this.api.post("table/link_image",
                                          {
                                            "no": UUID.UUID(),
                                            "param": '04',
                                            "param_desc": 'Tampak Bawah',
                                            "parent": result.uuid,
                                            "table_name": "Qc_out_result",
                                            "img_src": '',
                                            "file_name": '',
                                            "description": '',
                                            "latitude": "",
                                            "longitude": "",
                                            "location_code": '',
                                            "upload_date": datetime,
                                            "upload_by": ""
                                          },
                                          { headersa })
                                          .subscribe()
                                      });
                                }, err => {
                                  this.api.post("table/link_image",
                                    {
                                      "no": UUID.UUID(),
                                      "param": '03',
                                      "param_desc": 'Tampak Atas',
                                      "parent": result.uuid,
                                      "table_name": "Qc_out_result",
                                      "img_src": '',
                                      "file_name": '',
                                      "description": '',
                                      "latitude": "",
                                      "longitude": "",
                                      "location_code": '',
                                      "upload_date": datetime,
                                      "upload_by": ""
                                    },
                                    { headersa })
                                    .subscribe()
                                });
                          }, err => {
                            this.api.post("table/link_image",
                              {
                                "no": UUID.UUID(),
                                "param": '02',
                                "param_desc": 'Tampak Kanan',
                                "parent": result.uuid,
                                "table_name": "Qc_out_result",
                                "img_src": '',
                                "file_name": '',
                                "description": '',
                                "latitude": "",
                                "longitude": "",
                                "location_code": '',
                                "upload_date": datetime,
                                "upload_by": ""
                              },
                              { headersa })
                              .subscribe()
                          });
                    }, err => {
                      this.api.post("table/link_image",
                        {
                          "no": UUID.UUID(),
                          "param": '01',
                          "param_desc": 'Tampak Kiri',
                          "parent": result.uuid,
                          "table_name": "Qc_out_result",
                          "img_src": '',
                          "file_name": '',
                          "description": '',
                          "latitude": "",
                          "longitude": "",
                          "location_code": '',
                          "upload_date": datetime,
                          "upload_by": ""
                        },
                        { headersa })
                        .subscribe()
                    });
              }
            }
          ]
        });
        alert.present();
      }
      else {
        this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'", sort: "param" + " ASC " } })
          .subscribe(val => {
            this.photos = val['data'];
            this.totalphoto = val['count'];
            this.uuidqcresult = result.uuid;
            this.qcnoresult = result.qc_result_no;
            this.qcno = result.qc_no;
            this.receiptno = result.receipt_no;
            this.itemno = result.item_no;
            this.qcstatus = result.qc_status
            if (result.qc_status != 'PASSED') {
              document.getElementById("myQCChecking").style.display = "block";
              document.getElementById("myBTNChecking").style.display = "block";
              // document.getElementById("button").style.display = "block";
              document.getElementById("myHeader").style.display = "none";
              this.button = true;
            }
            else {
              document.getElementById("myQCChecking").style.display = "block";
              document.getElementById("myBTNChecking").style.display = "none";
              // document.getElementById("button").style.display = "none";
              document.getElementById("myHeader").style.display = "none";
            }
          });
      }
    }
  }
  doViewPhoto(foto) {
    this.viewfoto = foto.img_src
    this.param = foto.param
    this.parent = foto.parent
    this.paramdesc = foto.param_desc
    this.description = foto.description
    document.getElementById("foto").style.display = "block";
  }
  doPreviousFoto() {
    let param = parseInt(this.param) - parseInt('01')
    let paramprevious: string = "0" + param
    this.api.get("table/link_image", { params: { filter: 'parent=' + "'" + this.parent + "' AND param=" + "'" + paramprevious + "'"} }).subscribe(val => {
      this.photosview = val['data'];
      this.viewfoto = this.photosview[0].img_src
      this.param = this.photosview[0].param
      this.parent = this.photosview[0].parent
      this.paramdesc = this.photosview[0].param_desc
      this.description = this.photosview[0].description
    });
  }
  doNextFoto() {
    let param = parseInt(this.param) + parseInt('01')
    let parampnext: string = "0" + param
    this.api.get("table/link_image", { params: { filter: 'parent=' + "'" + this.parent + "' AND param=" + "'" + parampnext + "'"} }).subscribe(val => {
      this.photosview = val['data'];
      this.viewfoto = this.photosview[0].img_src
      this.param = this.photosview[0].param
      this.parent = this.photosview[0].parent
      this.paramdesc = this.photosview[0].param_desc
      this.description = this.photosview[0].description
    });
  }
  doCloseViewPhoto() {
    document.getElementById("foto").style.display = "none";
  }
  doViewFoto(foto) {
    this.doViewPhoto(foto);
  }
  doHapus(foto) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Yakin ingin menghapus foto ini?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Hapus',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");

            this.api.put("table/link_image",
              {
                "no": foto.no,
                "img_src": '',
                "file_name": '',
              },
              { headers })
              .subscribe(
                (val) => {
                  this.presentToast("Image deleted successfully");
                  this.photos = [];
                  this.api.get("table/link_image", { params: { filter: 'parent=' + "'" + this.uuidqcresult + "'", sort: "param" + " ASC " } }).subscribe(val => {
                    this.photos = val['data'];
                    this.totalphoto = val['count'];
                  });
                });
          }
        }
      ]
    });
    alert.present();
  }
  doCamera(foto) {
    if (this.qcstatus != 'PASSED') {
      let options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.FILE_URI
      }
      options.sourceType = this.camera.PictureSourceType.CAMERA

      this.camera.getPicture(options).then((imageData) => {
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
              handler: datadesc => {
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
                  fileName: this.receiptno + "-" + this.itemno + "-" + foto.param + uuid + '.jpeg',
                  chunkedMode: true,
                  mimeType: "image/jpeg",
                  headers: {}
                }

                let url = "http://101.255.60.202/serverapi/api/Upload";
                fileTransfer.upload(this.imageURI, url, options)
                  .then((data) => {
                    loader.dismiss();
                    let date = moment().format('YYYY-MM-DD HH:mm:ss');
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");

                    this.api.put("table/link_image",
                      {
                        "no": foto.no,
                        "img_src": 'http://101.255.60.202/serverapi/img/' + this.receiptno + "-" + this.itemno + "-" + foto.param + uuid,
                        "file_name": this.receiptno + "-" + this.itemno + "-" + foto.param + uuid,
                        "description": datadesc.description,
                        "upload_date": date,
                        "upload_by": ""
                      },
                      { headers })
                      .subscribe(
                        (val) => {
                          this.presentToast("Image uploaded successfully");
                          this.photos = [];
                          this.api.get("table/link_image", { params: { filter: 'parent=' + "'" + this.uuidqcresult + "'", sort: "param" + " ASC " } }).subscribe(val => {
                            this.photos = val['data'];
                            this.totalphoto = val['count'];
                          });
                        });
                    this.imageURI = '';
                    this.imageFileName = '';
                  }, (err) => {
                    loader.dismiss();
                    this.presentToast('Camera is closed');
                  });
              }
            }
          ]
        });
        alert.present();
      }, (err) => {
        this.presentToast('This Platform is Not Supported');
      });
    }
    else {
      this.doViewPhoto(foto);
    }
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
    if (this.photos[0].img_src == '' || this.photos[1].img_src == '' || this.photos[2].img_src == '' || this.photos[3].img_src == '') {
      let alert = this.alertCtrl.create({
        title: 'Warning',
        subTitle: 'Foto Tampak Kiri, Tampak Kanan, Tampak Atas dan Tampak Bawah harus terpenuhi',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
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
                      let time = moment().format('HH:mm:ss');
                      let date = moment().format('YYYY-MM-DD');
                      let uuid = UUID.UUID();
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
                            this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "' AND qc_status!= 'PASSED'" } }).subscribe(val => {
                              this.qcresultopen = val['data'];
                              if (this.qcresultopen.length == 0) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.put("table/qc_out",
                                  {
                                    "qc_no": this.qcno,
                                    "status": "CLSD"
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/qc_out', { params: { limit: 30, filter: "status='OPEN'" } })
                                      .subscribe(val => {
                                        this.quality_control = val['data'];
                                        this.totaldataqc = val['count'];
                                      });
                                    this.api.get('table/qc_out', { params: { limit: 30, filter: "status='CLSD'" } })
                                      .subscribe(val => {
                                        this.quality_control_clsd = val['data']
                                        this.searchqcclsd = this.quality_control_clsd
                                      });
                                  });
                              }
                              this.api.get('table/qc_out', { params: { limit: 30, filter: "status='OPEN'" } })
                                .subscribe(val => {
                                  this.quality_control = val['data'];
                                  this.totaldataqc = val['count'];
                                });
                              this.api.get('table/qc_out', { params: { limit: 30, filter: "status='CLSD'" } })
                                .subscribe(val => {
                                  this.quality_control_clsd = val['data']
                                  this.searchqcclsd = this.quality_control_clsd
                                });
                            });
                          });
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                        })
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
  doRejectQC() {
    if (this.photos[0].img_src == '' || this.photos[1].img_src == '' || this.photos[2].img_src == '' || this.photos[3].img_src == '') {
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Foto Tampak Kiri, Tampak Kanan, Tampak Atas dan Tampak Bawah harus terpenuhi',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
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
                      let time = moment().format('HH:mm:ss');
                      let date = moment().format('YYYY-MM-DD');
                      let uuid = UUID.UUID();
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
                          this.api.get("table/qc_out_result", { params: { filter: 'qc_result_no=' + "'" + this.qcnoresult + "'" } }).subscribe(val => {
                            let datareject = val['data'];
                            let uuidreject = UUID.UUID();
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            this.api.post("table/qc_out_result_reject",
                              {
                                "qc_result_no": datareject[0].qc_result_no,
                                "qc_no": datareject[0].qc_no,
                                "receipt_no": datareject[0].receipt_no,
                                "batch_no": '',
                                "item_no": datareject[0].item_no,
                                "date_start": datareject[0].date_start,
                                "date_finish": datareject[0].date_finish,
                                "time_start": datareject[0].time_start,
                                "time_finish": datareject[0].time_finish,
                                "qc_pic": datareject[0].qc_pic,
                                "qty_receiving": datareject[0].qty_receiving,
                                "unit": datareject[0].unit,
                                "qc_status": datareject[0].qc_status,
                                "qc_description": datareject[0].qc_description,
                                "uuid": uuidreject
                              },
                              { headers })
                              .subscribe(val => {
                                this.api.get('table/link_image', { params: { limit: 100, filter: "parent=" + "'" + datareject[0].uuid + "'" } })
                                  .subscribe(val => {
                                    let data = val['data'];
                                    for (let i = 0; i < data.length; i++) {
                                      let datai = data[i]
                                      this.doInsertfoto(datai, uuidreject)
                                    }
                                  });
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
                              });
                          });
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                        })
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
  doInsertfoto(datai, uuidreject) {
    let uuid = UUID.UUID();
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.post("table/link_image",
      {
        "no": uuid,
        "param": datai.param,
        "param_desc": datai.param_desc,
        "parent": uuidreject,
        "table_name": datai.table_name,
        "img_src": datai.img_src,
        "file_name": datai.file_name,
        "description": datai.description,
        "latitude": datai.latitude,
        "longitude": datai.longitude,
        "location_code": datai.location_code,
        "upload_date": datai.upload_date,
        "upload_by": ""
      },
      { headers })
      .subscribe(
        (val) => {
        }, err => {
          this.doInsertfoto(datai, uuidreject);
        });
  }
  doDetail(dm) {
    this.navCtrl.push('QcoutdetailPage', {
      receiptno: dm["Receipt No_"]
    });
  }
  doMyQC(dm) {
    let alert = this.alertCtrl.create({
      subTitle: 'Yakin ingin memasukan no invoice ini ' + dm["Receipt No_"] + ' ke MyQC ? ',
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
                    "receipt_no": dm["Receipt No_"],
                    "pic": this.userid,
                    "status": 'OPEN',
                    "uuid": UUID.UUID()
                  },
                  { headers })
                  .subscribe(val => {
                    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Line", filter: "[Receipt No_]=" + "'" + dm["Receipt No_"] + "'" } })
                      .subscribe(val => {
                        let data = val['data']
                        for (let i = 0; i < data.length; i++) {
                          let datai = data[i]
                          let nextnoqc = this.nextnoqc
                          this.doInsertQCResult(datai, nextnoqc);
                        }

                      })
                    this.datadm = [];
                    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Header", filter: "Status=0 AND [Expected Receipt Date] > '2018-01-01'", sort: "[Expected Receipt Date]" + " DESC " } })
                      .subscribe(val => {
                        let data = val['data'];
                        for (let i = 0; i < data.length; i++) {
                          this.api.get('table/qc_out', { params: { limit: 30, filter: "receipt_no=" + "'" + data[i]["Receipt No_"] + "'" } })
                            .subscribe(val => {
                              this.dataqc = val['data'];
                              if (this.dataqc.length == 0) {
                                this.datadm.push(data[i]);
                                this.totaldatadatadm = val['count'];
                                this.searchdatadm = this.datadm;
                              }
                              else if (this.dataqc.length) {

                              }
                            });
                        }
                      });
                    this.api.get('table/qc_out', { params: { limit: 30, filter: "status='OPEN'" } })
                      .subscribe(val => {
                        this.quality_control = val['data']
                        let alert = this.alertCtrl.create({
                          title: 'Sukses',
                          subTitle: 'Save Sukses',
                          buttons: ['OK']
                        });
                        alert.present();
                      });
                  });
              });
          }
        }
      ]
    });
    alert.present();
  }
  doInsertQCResult(datai, nextnoqc) {
    let time = moment().format('HH:mm:ss');
    let date = moment().format('YYYY-MM-DD');
    let datetime = moment().format('YYYYMMDDHHmm');
    let uuid = UUID.UUID();
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/qc_out_result",
      {
        "qc_result_no": datai["Receipt No_"] + datai["Item No_"] + datetime,
        "qc_no": nextnoqc,
        "receipt_no": datai["Receipt No_"],
        "batch_no": '',
        "item_no": datai["Item No_"],
        "qc_pic": this.userid,
        "qty_receiving": datai.Quantity,
        "unit": datai.UOM,
        "qc_status": "OPEN",
        "qc_description": "",
        "uuid": uuid
      },
      { headers })
      .subscribe(val => {
      }, err => {
        this.doInsertQCResult(datai, nextnoqc);
      });
  }
}