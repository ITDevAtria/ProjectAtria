import { Component } from '@angular/core';
import { LoadingController, MenuController, AlertController, Platform, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  atria: string = "warehouse";
  private token = '';
  private userid = '';
  private name: any;
  public role = [];
  public rolearea = '';
  public rolegroup = '';
  public rolecab = '';
  public width: any;
  public height: any;
  public loader: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public menu: MenuController,
    public platform: Platform,
    public alert: AlertController,
    private push: Push,
    public storage: Storage,
    public loadingCtrl: LoadingController) {
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Content...'
    });
    this.loader.present();
    platform.ready().then(() => {
      this.width = platform.width();
      this.height = platform.height();
    });
    this.atria = "warehouse";
    this.storage.get('token').then((val) => {
      this.token = val;
    });
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          if (this.role.length != 0) {
            this.rolearea = this.role[0].id_area
            this.rolegroup = this.role[0].id_group
            this.rolecab = this.role[0].id_cab
          }
        })
    });
  }  
  ngAfterViewInit() {
    this.loader.dismiss();
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
  doPreparationPO() {
    this.navCtrl.push('PurchasingorderPage');
  }
  doReceiving() {
    this.navCtrl.push('ReceivingPage', {
      rolecab: this.rolecab
    });
  }
  doQcIn() {
    this.navCtrl.push('QcinPage');
  }
  doQcOut() {
    this.navCtrl.push('QcoutPage');
  }
  doPutaway() {
    this.navCtrl.push('PutawayPage');
  }
  doMovement() {
    this.navCtrl.push('MovementPage');
  }
  doPicking() {
    this.navCtrl.push('PickingPage');
  }
  doProfile() {
    this.navCtrl.push('UseraccountPage');
  }
  doTransferOrder() {
    this.navCtrl.push('TransferorderPage');
  }
}
