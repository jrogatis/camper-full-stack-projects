'use strict';

import angular from 'angular';

export function OauthButtonsController($window) {
  this.loginOauth = function(provider) {
    $window.location.href = '/auth/' + provider;
  };
}

OauthButtonsController.$inject = ['$window'];

export default angular.module('camperFullStackProjectsApp.oauthButtons', [])
  .directive('oauthButtons', function() {
    return {
      template: require('./oauth-buttons.pug'),
      restrict: 'EA',
      controller: OauthButtonsController,
      controllerAs: 'OauthButtons',
      scope: {
        classes: '@'
      }
    };
  })
  .name;
