import { Component } from '@angular/core';
import { MenuController, AlertController, Platform, NavController, NavParams } from 'ionic-angular';
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
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public menu: MenuController,
    public platform: Platform,
    public alert: AlertController,
    private push: Push,
    public storage: Storage) {
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
          }
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
  doPreparationPO() {
    this.navCtrl.push('PurchasingorderPage');
  }
  doReceiving() {
    this.navCtrl.push('ReceivingPage');
  }
  doQcIn() {
    this.navCtrl.push('QcinPage');
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
}
