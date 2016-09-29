'use strict';

export default function routes($routeProvider) {
  'ngInject';

  $routeProvider
    .when('/books', {
      template: '<books></books>'
    });
}
