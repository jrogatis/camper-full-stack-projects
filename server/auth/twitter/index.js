'use strict';

import express from 'express';
import passport from 'passport';
import {setTokenCookie} from '../auth.service';

var router = express.Router();
var urlRedirect;
router
  .get('/', passport.authenticate('twitter', {
    failureRedirect: '/signup',
    session: false
  }))
   .get('/nl/:redirectTo',(req,res,next) => {
      urlRedirect =req.params.redirectTo
      console.log('urlRedirect', urlRedirect);
     passport.authenticate('twitter', {
      failureRedirect: '/signup',
      session: false
    })
     console.log('urlRedirect', 'terminei');
  })
  .get('/callback', passport.authenticate('twitter', {
    failureRedirect: '/signup',
    successRedirect: urlRedirect,
    session: false
  }), setTokenCookie);

export default router;
