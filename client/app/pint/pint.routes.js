'use strict';

export default function routes($routeProvider) {
  'ngInject';

  $routeProvider
    .when('/pint', {
      template: '<pint></pint>'
    });
}
