'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';

export default angular.module('camperFullStackProjectsApp.admin', [
  'camperFullStackProjectsApp.auth', 'ngRoute'
])
  .config(routes)
  .controller('AdminController', AdminController)
  .name;
