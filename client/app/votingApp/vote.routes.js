'use strict';

export default function routes($routeProvider) {
  'ngInject';

  $routeProvider
    .when('/vote', {
      template: '<vote></vote>'
    });
}
