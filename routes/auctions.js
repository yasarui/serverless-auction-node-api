const express = require('express');
const { getAllAuctions, getAuction, createAuction, updateAuction, updateAuctionPicture } = require('../controllers/auctionController'); 
const { successResponse } = require('../utils/responseApi');
const { createAuctionSchema, updateAuctionSchema, getAllAuctionsSchema, updateAuctionPictureSchema } = require('../schema/auctionSchemas');
const apiSchemaValidation = require('../middlewares/apiSchemaValidation');

const router = express.Router();

router.get('/', apiSchemaValidation.validateQueryParams(getAllAuctionsSchema), async (req, res, next)=>{
   const { status } = req.query;
   try{
     const results = await getAllAuctions(status.toUpperCase());
     const response = successResponse(`All the ${status} auctions`, results)
     res.status(200).json(response);
   }catch(error){
     next(error);
   }
});

router.get('/:id', async (req, res, next)=> {
   const id = req.params.id
   try{
     const result = await getAuction(id);
      const response = successResponse('Auction with the open id', result);
      res.status(200).json(response);
   } catch(error) {
     next(error);
   }
});

router.post('/', apiSchemaValidation.validateBody(createAuctionSchema), async (req, res, next)=>{
   const { title } = req.body;
   const { email } = req.apiGateway.event.requestContext.authorizer.lambda;
   try {
     const result = await createAuction(title, email);
     const response = successResponse('New Auction created', result, 201);
     res.status(200).json(response);
   } catch (error) {
       next(error);
   }
})

router.patch('/:id/bid',apiSchemaValidation.validateBody(updateAuctionSchema), async (req, res, next)=>{
   const { id } = req.params;
   const { amount } = req.body;
   const { email } = req.apiGateway.event.requestContext.authorizer.lambda;
   try {
     const result = await updateAuction(id, amount, email);
     const response = successResponse('Bid placed successfully', result, 200);
     res.status(200).json(response);
   } catch (error) {
    next(error);
   }
});

router.patch('/:id/picture',apiSchemaValidation.validateBody(updateAuctionPictureSchema), async (req, res, next)=>{
   const { id } = req.params;
   const { email } = req.apiGateway.event.requestContext.authorizer.lambda;
   const base64 = req.body.image.replace(/^data:image\/\w+;base64,/, '');
   const buffer = Buffer.from(base64, 'base64');
   try {
     const result = await updateAuctionPicture(id, email, buffer);
     const response = successResponse('Picture updated Successfully', result, 200);
     res.status(200).json(response);
   } catch(error) {
     next(error)
   }
});


module.exports = router;
