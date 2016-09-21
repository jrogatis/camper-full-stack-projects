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
   .get('/nl/:redirectTo',
     passport.authenticate('twitter', (req, res) => {
      res.redirect(req.params.redirectTo);
    })
  )
 .get('/callback', passport.authenticate('twitter', {
    failureRedirect: '/signup',
    session: false
  }), setTokenCookie);

export default router;
