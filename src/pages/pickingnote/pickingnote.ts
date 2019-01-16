import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-pickingnote',
  templateUrl: 'pickingnote.html',
})
export class PickingnotePage {

  public receiptno: any;
  public data = [];
  public datacust = [];
  public dataitem = [];
  public datapart = [];
  public items = [];
  public datenow: any;
  public storename: any;
  public toreservation: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController) {
    this.receiptno = navParams.get('receiptno')
    this.datenow = moment().format('YYYY-MM-DD');
    this.doGetListPicking()
    this.doGetListPickingDetail()
  }

  ionViewDidLoad() {

  }
  doGetListPicking() {
    this.api.get("tablenav", { params: { limit: 1, table: "CSB_LIVE$Delivery Management Header", filter: "[Receipt No_]=" + "'" + this.receiptno + "'" } })
      .subscribe(val => {
        this.data = val['data']
        console.log(this.data)
        this.api.get("tablenav", { params: { limit: 1, table: "CSB_LIVE$Sales Header Archive", filter: "[No_]=" + "'" + this.data[0]["SO No_"] + "'" } })
          .subscribe(val => {
            this.datacust = val['data']
            this.toreservation = this.datacust[0]["TO Reservation No_"]
            console.log(this.datacust)
            this.api.get("tablenav", { params: { limit: 1, table: "CSB_LIVE$Location", filter: "[Code]=" + "'" + this.datacust[0]["Store No_"] + "'" } })
              .subscribe(val => {
                let data = val['data']
                this.storename = data[0]["Name"]
              });
          });
      }, err => {
        this.doGetListPicking()
      });
  }
  doGetListPickingDetail() {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Line", filter: "[Receipt No_]=" + "'" + this.receiptno + "'" } })
      .subscribe(val => {
        this.dataitem = val['data']
        let data = val['data'];
        for (let i = 0; i < data.length; i++) {
          this.api.get("tablenav", { params: { limit: 100, table: "CSB_LIVE$Production BOM Line", filter: "[Production BOM No_]=" + "'B-" + data[i]["Item No_"] + "'" } })
          .subscribe(val => {
            let datapart = val['data']
            for (let i = 0; i < datapart.length; i++) {
              this.datapart.push(datapart[i]);
            }
            console.log('1', this.datapart)
          });
        }
      }, err => {
        this.doGetListPickingDetail()
      });
  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  doPrint() {
    /*var divContents = document.getElementById("printarea").innerHTML;
    var printWindow = window.open();
    printWindow.document.write('<html><head><title>Print Picking Note</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div style="margin-top:10px;text-align:center;border:1px solid;border-color:transparent">');
    printWindow.document.write('<div style="text-align:center;float:left;padding-top:10px;width:24%;margin-bottom:5px;margin-right:5px;border:1px solid;border-color:#dedede"">');
    printWindow.document.write(divContents);
    printWindow.document.write('</div>');
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();*/
    window.print();
  }

}
