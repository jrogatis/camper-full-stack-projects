'use strict';

export default function routes($routeProvider) {
  'ngInject';

  $routeProvider
    .when('/vote/:id', {
      template: '<poll></poll>'
    });
}
