'use strict';

export default function routes($routeProvider) {
  'ngInject';

  $routeProvider
    .when('/nl', {
      template: '<nl></nl>'
    })
    .when('/nl/:searchString', {
      template: '<nl></nl>'
    });
}
