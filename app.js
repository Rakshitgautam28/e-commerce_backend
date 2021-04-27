const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const app = express();

//import routes
const productsRoute = require('./routes/products');
const usersRoute = require('./routes/users');
const orderRoute = require('./routes/orders')
//use routes
app.use('/api/products', productsRoute);
app.use('/api/users', usersRoute);
app.use('/api/orders', orderRoute)
//maybeanerrorherepleasecheckuserscauseithinkusershouldbechangedtoorders
const indexRouter = require('./routes/products');
const usersRouter = require('./routes/users');



app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: 'Content-type, Authorization, Origin, X-Requested-With, Accept,Access-Control-Allow-Origin'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



module.exports = app;
