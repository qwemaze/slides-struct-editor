"use strict";

const express = require( 'express' );
const ext = require( '../dbmodel' );
const rest = require( '../lib/rest' );
const Log = require( 'debug' )( 'app:router' );

const router = express.Router();

Object.keys( ext ).map( modelname => {
	let mRouter = express.Router();
	ext[ modelname ] && ext[ modelname ]( mRouter, modelname );
	rest( modelname, mRouter );
	router.use( `/${modelname}`, mRouter );
} );

module.exports = router;
