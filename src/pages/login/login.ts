import { Component } from '@angular/core';
import { Events, AlertController, App, ViewController, Platform, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from '../../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import { HomePage } from '../../pages/home/home';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  myForm: FormGroup;
  private width: number;
  private height: number;
  login: string = "signin";
  rootPage: any;
  private token: any;
  private user = [];
  private tokennotification = '';
  public role = [];
  public preparation = [];
  public rolearea = '';
  public rolegroup = '';
  public rolecab = '';

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public fb: FormBuilder,
    public api: ApiProvider,
    public viewCtrl: ViewController,
    public appCtrl: App,
    private alertCtrl: AlertController,
    public events: Events) {
    this.myForm = fb.group({
      userid: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    })
    platform.ready().then(() => {
      this.width = platform.width();
      this.height = platform.height();
    });
    this.login = "signin";
  }

  ionViewDidLoad() {
  }
  doLogin() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("token",
      {
        "userid": this.myForm.value.userid,
        "password": this.myForm.value.password
      },
      { headers })
      .subscribe((val) => {
        this.token = val['token'];
        this.api.get('table/user', { params: { filter: "id_user=" + "'" + this.myForm.value.userid + "'" } })
          .subscribe(val => {
            this.user = val['data'];
            this.storage.set('token', this.token);
            var sometext = this.user[0].id_user;
            var upperid = sometext.toUpperCase();
            console.log(upperid)
            this.storage.set('userid', upperid);
            this.storage.set('name', this.user[0].name);
            this.storage.get('tokennotification').then((val) => {
              this.tokennotification = val;
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.put("table/user",
                {
                  "id_user": this.user[0].id_user,
                  "token": this.tokennotification
                },
                { headers })
                .subscribe(val => {
                  this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.myForm.value.userid + "'" } })
                    .subscribe(val => {
                      this.role = val['data']
                      if (this.role.length != 0) {
                        this.rolearea = this.role[0].id_area
                        this.rolegroup = this.role[0].id_group
                        this.rolecab = this.role[0].id_cab
                        this.api.get('table/purchasing_order', { params: { limit: 30, filter: "status='INP2'" + " AND " + "(pic=" + "'" + this.myForm.value.userid + "'" + " OR " + "pic_lokasi=" + "'" + this.myForm.value.userid + "'" + " OR " + "pic_barcode=" + "'" + this.myForm.value.userid + "')" } })
                          .subscribe(val => {
                            this.preparation = val['data'];
                            if (this.preparation.length == 0) {
                              this.appCtrl.getRootNav().setRoot(HomePage);
                            }
                            else {
                              let alert = this.alertCtrl.create({
                                subTitle: 'Notification',
                                message: 'Anda mempunyai pekerjaan yang belum diselesaikan',
                                buttons: ['OK']
                              });
                              alert.present();
                              this.appCtrl.getRootNav().setRoot('TaskPage');
                            }
                          });
                        this.events.publish('user:login', this.role, Date.now());
                        this.myForm.reset();
                      }
                    })
                })
            });
          });
      }, (e) => {
        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: 'Username or Password is Incorrect',
          buttons: ['OK']
        });
        alert.present();
      });
  }

}
