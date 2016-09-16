'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';
const ngRoute = require('angular-route');
import uiBootstrap from 'angular-ui-bootstrap';

// import ngMessages from 'angular-messages';
// import ngValidationMatch from 'angular-validation-match';


import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import ModalService from '../components/modal/modal.service';
import angularAria from 'angular-aria';
import angularAnimate from 'angular-animate';
import angularMaterial from 'angular-material';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';
import vote from './votingApp/vote.component';
import poll from './VotingApp/poll/poll.component';
import nl from './nightLifeApp/nl.component';
import './app.scss';

angular.module('camperFullStackProjectsApp', [ngCookies, ngResource, ngSanitize, 'btford.socket-io',
    ngRoute, uiBootstrap, _Auth, ModalService, angularAria, angularAnimate, angularMaterial, account, admin, navbar, footer, main, vote, poll, nl, constants, socket, util
  ])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['camperFullStackProjectsApp'], {
      strictDi: true
    });
  });
