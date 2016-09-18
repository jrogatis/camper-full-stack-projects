'use strict';

import oauthSignature from 'oauth-signature';
const n = require('nonce')();
import _ from 'lodash';

export function requestYelp(setParameters, callbacksCounter, callback) {
  /* The type of request */
  const httpMethod = 'GET';

  /* The url we are using for the request */
  const url = 'http://api.yelp.com/v2/search';

  /* We can setup default parameters here */
  const defaultParameters = {
    location: 'San+Francisco',
    sort: '2'
  };

  const requiredParameters = {
    callback: `angular.callbacks._${callbacksCounter}`,
    oauth_consumer_key: '00T9eKyi3fovmKiszGsXqA', // process.env.oauthConsumerKey,
    oauth_token: 'X9ua8EA50HuTmfPWxnNNxCN8lTmjts2H', //process.env.oauthToken,
    oauth_nonce: n(),
    oauth_timestamp: n().toString().substr(0, 10),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version: '1.0'
  };

  /* We combine all the parameters in order of importance */
  const parameters = _.assign(defaultParameters, setParameters, requiredParameters);

  /* We set our secrets here */
  const consumerSecret = 'oaTrmnJ2Bn3PAiFi47Ajy0k6OUk'; //process.env.consumerSecret;
  const tokenSecret = '2cY8eLt12iobZSEq-NmYmTxmOfA'; //process.env.tokenSecret;

  /* Then we call Yelp's Oauth 1.0a server, and it returns a signature */
  /* Note: This signature is only good for 300 seconds after the oauth_timestamp */
  const signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, {
    encodeSignature: false
  });

  /* We add the signature to the list of paramters */
  parameters.oauth_signature = signature;

  return callback(url, parameters);
}
