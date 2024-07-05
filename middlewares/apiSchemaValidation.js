const Joi = require('joi');
const { validationResponse } = require('../utils/responseApi');

const validateObjectSchema = (data,schema) => {
    const result = schema.validate(data);
    if(result.error){
        const errorDetails = result.error.details.map((value)=>{
           return {
               error:value.message,
               path:value.path
           }
        });
        return errorDetails;
    }
    return null;
}

module.exports.validateBody = (schema) => {
   return (req,res,next) => {
      const error = validateObjectSchema(req.body,schema);
      if(error){
        const validationResp = validationResponse(error);
        return res.status(422).json(validationResp);
      }
      return next();
   }
}

module.exports.validateQueryParams = (schema) => {
    return (req,res,next) => {
       const error = validateObjectSchema(req.query,schema);
       if(error){
         const validationResp = validationResponse(error);
         return res.status(422).json(validationResp);
       }
       return next();
    }
 }