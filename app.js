const express = require('express'); 								// https://www.npmjs.com/package/express
const session = require('express-session');							// https://www.npmjs.com/package/express-session
const passport = require('passport');								// https://www.npmjs.com/package/passport
const WebAppStrategy = require('ibmcloud-appid').WebAppStrategy;	// https://www.npmjs.com/package/ibmcloud-appid

const app = express();


app.use(session({
	secret: '123456',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));
passport.use(new WebAppStrategy({
	tenantId: "56279263-d05c-43f7-b829-1482f907d33c",
	clientId: "2c2c5be1-62f1-4b43-bdda-aa2ce922ba91",
	secret: "MTZiMWNhNzgtMDY4Ny00ZDUxLThiMGUtMmY2NDI4MDNhNTYx",
	oauthServerUrl: "https://eu-gb.appid.cloud.ibm.com/oauth/v4/56279263-d05c-43f7-b829-1482f907d33c",
	redirectUri: "http://localhost:3000/appid/callback"
}));

// Handle Login
app.get('/appid/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: '/',
	forceLogin: true
}));

// Handle callback
app.get('/appid/callback', passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// Handle logout
app.get('/appid/logout', function(req, res){
	WebAppStrategy.logout(req);
	res.redirect('/');
});

// Protect the whole app
// app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// Make sure only requests from an authenticated browser session can reach /api
app.use('/api', (req, res, next) => {
	if (req.user){
		next();
	} else {
		res.status(401).send("Unauthorized");
	}
});

// The /api/user API used to retrieve name of a currently logged in user
app.get('/api/user', (req, res) => {
	// console.log(req.session[WebAppStrategy.AUTH_CONTEXT]);
	res.json({
		user: {
			name: req.user.name
		}
	});
});

// Serve static resources
app.use(express.static('./public'));

// Start server
app.listen(3000, () => {
    console.log('Listening on http://localhost:3000');
});