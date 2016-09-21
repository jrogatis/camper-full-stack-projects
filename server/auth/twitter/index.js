'use strict';

import express from 'express';
import passport from 'passport';
import {setTokenCookie,signToken } from '../auth.service';


var router = express.Router();
var urlRedirect;
router
  .get('/', passport.authenticate('twitter', {
    failureRedirect: '/signup',
    session: false
  }))
   .get('/nl/:redirectTo',(req, res) => {
      console.log('no redirect');
      urlRedirect =  req.params.redirectTo;
      res.redirect(`/auth/twitter/`);
})
 .get('/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/signup',
      session: false
    }),
    (req, res) => {
      if(!req.user) {
        return res.status(404).send('It looks like you aren\'t logged in, please try again.');
      }
      var token = signToken(req.user._id, req.user.role);
      res.cookie('token', token);
      res.redirect(urlRedirect);
    }
  );

export default router;
