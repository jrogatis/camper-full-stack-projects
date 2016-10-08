'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
    /*@ngInject*/
  constructor($location, Auth ) {

    this.$location = $location;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
  }

  isActive(route) {
    return route === this.$location.path();
  }

  buildMenu() {
     isActive
    //console.log(window.location.pathname + window.location.search)

  }
}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.pug'),
    controller: NavbarComponent
  })
  .name;
