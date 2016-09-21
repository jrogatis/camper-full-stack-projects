/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/yelp/:id          ->  show
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import querystring from 'querystring';
import oauthSignature from 'oauth-signature';
const n = require('nonce')();
import _ from 'lodash';
import qs from 'querystring';
import request from 'request';

const request_yelp = function(search_parameters, callback) {

  const httpMethod = 'GET';
  const url = 'http://api.yelp.com/v2/search';

  const  set_parameters = {
    location: search_parameters,
    sort: '2'
  };

  const required_parameters = {
    //callback : 'cb',
    oauth_consumer_key : process.env.oauth_consumer_key,
    oauth_token : process.env.oauth_token,
    oauth_nonce : n(),
    oauth_timestamp : n().toString().substr(0,10),
    oauth_signature_method : 'HMAC-SHA1',
    oauth_version : '1.0'
  };
  const parameters = _.assign(set_parameters, required_parameters);
  const consumerSecret = process.env.consumerSecret;
  const tokenSecret = process.env.tokenSecret;
  const signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, { encodeSignature: false});
  parameters.oauth_signature = signature;
  const paramURL = qs.stringify(parameters);
  const apiURL = url+'?'+paramURL;
  /* Then we use request to send make the API Request */
  request(apiURL, function(error, response, body){
    return callback(error, response, body);
  });

};

// Gets a list of venues
export function index(req, res) {

  request_yelp(req.params.setParams , (error, response, body) =>{
    if (!error) {
      //console.log(body.businesses);
      res.status(200).end(body);
    } else {
      console.log(error)
    }
  })
}
