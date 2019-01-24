import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-task',
  templateUrl: 'task.html',
})
export class TaskPage {
  private preparation = [];
  private receiving = [];
  private quality_control = [];
  private qcresult = [];
  public userid: any;
  public role = [];
  public roleid = '';
  private qclist = '';
  private batchnolist = '';
  private qcqty = '';
  public detailqc: boolean = false;
  public rolecab = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public api: ApiProvider) {
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/purchasing_order', {
        params: {
          limit: 30, filter: "(status='INP2'" + " AND " +
            "((pic=" + "'" + this.userid + "')" +
            " OR " +
            "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
            " OR " +
            "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
        }
      })
        .subscribe(val => {
          this.preparation = val['data'];
        });
      this.api.get('table/purchasing_order', { params: { limit: 30, filter: "status='INPG'" + " AND " + "pic=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.receiving = val['data'];
        });
      this.api.get('table/qc_in', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='OPEN'" } })
        .subscribe(val => {
          this.quality_control = val['data'];
        });
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          this.roleid = this.role[0].id_group
          this.rolecab = this.role[0].id_cab
        })
    });
  }
  getPrepare() {
    this.api.get('table/purchasing_order', {
      params: {
        limit: 30, filter: "(status='INP2'" + " AND " +
          "((pic=" + "'" + this.userid + "')" +
          " OR " +
          "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
          " OR " +
          "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
      }
    })
      .subscribe(val => {
        this.preparation = val['data'];
      });
  }
  viewDetailPrepare(prepare) {
    if (this.userid == prepare.pic) {
      this.navCtrl.push('PurchasingorderPage')
    }
    else {
      this.navCtrl.push('DetailpoactionPage', {
        poid: prepare.po_id,
        orderno: prepare.order_no,
        docno: prepare.doc_no,
        batchno: prepare.batch_no,
        locationcode: prepare.location_code,
        transferdate: prepare.transfer_date,
        status: prepare.status,
        totalpost: prepare.total_item_post,
        pic: prepare.pic,
        piclokasi: prepare.pic_lokasi,
        picbarcode: prepare.pic_barcode
      });
    }
  }
  getReceiving() {
    this.api.get('table/purchasing_order', { params: { limit: 30, filter: "status='INPG'" + " AND " + "pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.receiving = val['data'];
      });
  }
  viewDetail(rcv) {
    this.navCtrl.push('ReceivingdetailPage', {
      orderno: rcv.order_no,
      docno: rcv.doc_no,
      batchno: rcv.batch_no,
      locationcode: rcv.location_code,
      expectedreceiptdate: rcv.expected_receipt_date
    });
  }
  getQC() {
    this.api.get('table/qc_in', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='OPEN'" } })
      .subscribe(val => {
        this.quality_control = val['data'];
      });
  }
  getQCResult(myqc) {
    return new Promise(resolve => {
      this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + myqc.qc_no + "'" } }).subscribe(val => {
        this.qcresult = val['data'];
        resolve();
      })
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
  doRefresh(refresher) {
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/purchasing_order', {
        params: {
          limit: 30, filter: "(status='INP2'" + " AND " +
            "((pic=" + "'" + this.userid + "')" +
            " OR " +
            "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
            " OR " +
            "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
        }
      })
        .subscribe(val => {
          this.preparation = val['data'];
        });
      this.api.get('table/purchasing_order', { params: { limit: 30, filter: "status='INPG'" + " AND " + "pic=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.receiving = val['data'];
        });
      this.api.get('table/qc_in', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='OPEN'" } })
        .subscribe(val => {
          this.quality_control = val['data'];
        });
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          this.roleid = this.role[0].id_group
          this.rolecab = this.role[0].id_cab
        })
      refresher.complete();
    });
  }

}
