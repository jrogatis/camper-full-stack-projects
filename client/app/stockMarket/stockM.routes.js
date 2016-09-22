'use strict';

export default function routes($routeProvider) {
  'ngInject';

  $routeProvider
    .when('/stockM', {
      template: '<stockM></stockM>'
    })
}
