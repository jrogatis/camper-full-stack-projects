'use strict';

export default class SettingsController {

  /*@ngInject*/
  constructor(Auth) {
    this.Auth = Auth;
    this.user = {};
    this.onInit();
  }

  onInit() {
    this.Auth.getCurrentUser().then(user => {
      this.user.fullName = user.fullName;
      this.user.city = user.city;
      this.user.state = user.state;
    });
  }

  changeSettings(Settingform) {
    this.submitted = true;
    this.Auth.changeSettings(this.user)
      .then(() => {
        this.message = 'User successfully changed.';
      })
      .catch(error => {
        this.message = error;
      });
  }

  changePassword(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.message = 'Password successfully changed.';
        })
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Incorrect password';
          this.message = '';
        });
    }
  }
}
