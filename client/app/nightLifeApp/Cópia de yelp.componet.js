'use strict';
/* require the modules needed */
import oauthSignature from 'oauth-signature';  
const n = require('nonce')();  
//var request = require('request');
import qs from 'querystring';  
import _  from 'lodash';

/* Function for yelp call
 * ------------------------
 * set_parameters: object with params to search
 * callback: callback(error, response, body)
 */
export function requestYelp(setParameters, callback) {
  /* The type of request */
  const httpMethod = 'GET';

  /* The url we are using for the request */
  const url = 'http://api.yelp.com/v2/search';

  /* We can setup default parameters here */
  const defaultParameters = {
    location: 'San+Francisco',
    sort: '2'
  };

  /* We set the require parameters here */
  const requiredParameters = {
    oauth_consumer_key : '00T9eKyi3fovmKiszGsXqA',// process.env.oauthConsumerKey,
    oauth_token : 'rUQVPFXfokdWwkIuA2icf_d41JmOepak',//process.env.oauthToken,
    oauth_nonce : n(),
    oauth_timestamp : n().toString().substr(0,10),
    oauth_signature_method : 'HMAC-SHA1',
    oauth_version : '1.0'
  };
 
  /* We combine all the parameters in order of importance */ 
  const parameters = _.assign(defaultParameters, setParameters, requiredParameters);

  /* We set our secrets here */
  const consumerSecret = 'oaTrmnJ2Bn3PAiFi47Ajy0k6OUk';//process.env.consumerSecret;
  const tokenSecret = 'GkjNrGLMzZzXd-NCYfnz-3HgGtY';//process.env.tokenSecret;

  /* Then we call Yelp's Oauth 1.0a server, and it returns a signature */
  /* Note: This signature is only good for 300 seconds after the oauth_timestamp */
  const signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, { encodeSignature: false});

  /* We add the signature to the list of paramters */
  parameters.oauth_signature = signature;

  /* Then we turn the paramters object, to a query string */
  const paramURL = qs.stringify(parameters);

  /* Add the query string to the url */
  const apiURL = url+'?'+paramURL;
  
  //console.log(apiURL);
  
  return callback(apiURL);
  /* Then we use request to send make the API Request */
  /*request(apiURL, function(error, response, body){
    return callback(error, response, body);
  });*/

};