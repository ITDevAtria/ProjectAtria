import { Component } from '@angular/core';
import { MenuController, AlertController, Platform, IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { LoginPage } from '../../pages/login/login';
import { Storage } from '@ionic/storage';
import { HttpHeaders } from "@angular/common/http";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-users',
  templateUrl: 'users.html',
})
export class UsersPage {

  myForm: FormGroup;
  public users = [];
  public location = [];
  public addusersshow: boolean = false;
  public updateusershow: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public menu: MenuController,
    public platform: Platform,
    public alert: AlertController,
    public fb: FormBuilder,
    public storage: Storage) {
    this.myForm = fb.group({
      iduser: ['', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.required])],
      area: ['', Validators.compose([Validators.required])],
      group: ['', Validators.compose([Validators.required])],
      role: ['', Validators.compose([Validators.required])],
      location: ['', Validators.compose([Validators.required])]
    })
    this.doGetUsers()
    this.doGetLocation()

  }
  doGetLocation() {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Location", sort: "[Code]" + " ASC " } })
      .subscribe(val => {
        this.location = val['data']
      });
  }
  doGetUsers() {
    this.api.get('table/user_role', { params: { limit: 200 } })
      .subscribe(val => {
        this.users = val['data']
      });
  }
  getSearchID(ev: any) {
    // set val to the value of the searchbar
    let value = ev;
    console.log(value)

    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/user_role", { params: { limit: 30, filter: "id_user LIKE" + "'%" + value + "%'", sort: "id_user" + " ASC " } })
        .subscribe(val => {
          let data = val['data']
          this.users = data.filter(user => {
            return user.id_user.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.users = [];
      this.doGetUsers()
    }
  }
  getSearchName(ev: any) {
    // set val to the value of the searchbar
    let value = ev;

    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/user_role", { params: { limit: 30, filter: "name LIKE" + "'%" + value + "%'", sort: "name" + " ASC " } })
        .subscribe(val => {
          let data = val['data']
          this.users = data.filter(user => {
            return user.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.users = [];
      this.doGetUsers()
    }
  }
  getSearchArea(ev: any) {
    // set val to the value of the searchbar
    let value = ev;

    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/user_role", { params: { limit: 30, filter: "id_area LIKE" + "'%" + value + "%'", sort: "id_area" + " ASC " } })
        .subscribe(val => {
          let data = val['data']
          this.users = data.filter(user => {
            return user.id_area.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.users = [];
      this.doGetUsers()
    }
  }
  getSearchGroup(ev: any) {
    // set val to the value of the searchbar
    let value = ev;

    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/user_role", { params: { limit: 30, filter: "id_group LIKE" + "'%" + value + "%'", sort: "id_group" + " ASC " } })
        .subscribe(val => {
          let data = val['data']
          this.users = data.filter(user => {
            return user.id_group.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.users = [];
      this.doGetUsers()
    }
  }
  getSearchRole(ev: any) {
    // set val to the value of the searchbar
    let value = ev;

    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/user_role", { params: { limit: 30, filter: "id_role LIKE" + "'%" + value + "%'", sort: "id_role" + " ASC " } })
        .subscribe(val => {
          let data = val['data']
          this.users = data.filter(user => {
            return user.id_role.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.users = [];
      this.doGetUsers()
    }
  }
  getSearchCab(ev: any) {
    // set val to the value of the searchbar
    let value = ev;

    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/user_role", { params: { limit: 30, filter: "id_cab LIKE" + "'%" + value + "%'", sort: "id_cab" + " ASC " } })
        .subscribe(val => {
          let data = val['data']
          this.users = data.filter(user => {
            return user.id_cab.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.users = [];
      this.doGetUsers()
    }
  }
  doOffAddUsers() {
    this.addusersshow = false;
  }
  doOpenAddUsers() {
    this.addusersshow = true;
  }
  doOffUpdateUsers() {
    this.updateusershow = false;
  }
  doOpenUpdateUsers(user) {
    this.updateusershow = true;
    this.myForm.get('iduser').setValue(user.id_user)
    this.myForm.get('name').setValue(user.name)
    this.myForm.get('area').setValue(user.id_area)
    this.myForm.get('group').setValue(user.id_group)
    this.myForm.get('role').setValue(user.id_role)
    this.myForm.get('location').setValue(user.id_cab)
  }
  doInsertUsers() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/user_role",
      {
        "id_user": this.myForm.value.iduser,
        "name": this.myForm.value.name,
        "id_area": this.myForm.value.area,
        "id_group": this.myForm.value.group,
        "id_role": this.myForm.value.role,
        "id_cab": this.myForm.value.location
      },
      { headers })
      .subscribe(
        (val) => {
          this.api.post("table/user",
            {
              "id_user": this.myForm.value.iduser,
              "name": this.myForm.value.name,
              "password": 'bf89302bf73d0f44e7f89ed017d50e2f'
            },
            { headers })
            .subscribe(
              (val) => {
                this.myForm.reset()
                this.doOffAddUsers()
                this.doGetUsers()
                let alert = this.alert.create({
                  title: 'Sukses',
                  subTitle: 'Insert User Sukses',
                  buttons: ['OK']
                });
                alert.present();
              });
        });
  }
  doUpdateUsers() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/user_role",
      {
        "id_user": this.myForm.value.iduser,
        "name": this.myForm.value.name,
        "id_area": this.myForm.value.area,
        "id_group": this.myForm.value.group,
        "id_role": this.myForm.value.role,
        "id_cab": this.myForm.value.location
      },
      { headers })
      .subscribe(val => {
        this.api.put("table/user",
          {
            "id_user": this.myForm.value.iduser,
            "name": this.myForm.value.name,
          },
          { headers })
          .subscribe(
            (val) => {
              this.myForm.reset()
              this.doOffUpdateUsers()
              this.doGetUsers()
              let alert = this.alert.create({
                title: 'Sukses',
                subTitle: 'Update User Sukses',
                buttons: ['OK']
              });
              alert.present();
            });
      });
  }
  doDeleteUsers(user) {
    let alert = this.alert.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete  ' + user.name + ' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Delete',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");
            this.api.delete("table/user_role", { params: { filter: "id_user=" + "'" + user.id_user + "'" }, headers })
              .subscribe(val => {
                this.api.delete("table/user", { params: { filter: "id_user=" + "'" + user.id_user + "'" }, headers })
                  .subscribe(val => {
                    this.doGetUsers()
                    let alert = this.alert.create({
                      title: 'Sukses',
                      subTitle: 'Delete User Sukses',
                      buttons: ['OK']
                    });
                    alert.present();
                  });
              });
          }
        }
      ]
    });
    alert.present();
  }
}
