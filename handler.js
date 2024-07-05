require('dotenv').config();
const express = require("express");
const serverless = require("serverless-http");
const auctionsRoutes = require('./routes/auctions');
const createError = require('http-errors');
const { errorResponse } = require('./utils/responseApi');

//Init app
const app = express();

// Request Payload middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Route Handling
app.use('/auctions', auctionsRoutes);

// Handling Not found
app.use((req, res, next) => {
   next(createError.NotFound())
});

// Global Error Handling Middlewares
app.use((err, req, res, next)=>{
   const status = err.status || 500;
   const response = errorResponse(err.message, status);
   res.status(status).json(response);
});

exports.handler = serverless(app);
