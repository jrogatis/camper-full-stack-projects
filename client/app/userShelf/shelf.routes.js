'use strict';

export default function routes($routeProvider) {
  'ngInject';

  $routeProvider
    .when('/shelf', {
      template: '<shelf></shelf>'
    });
}
