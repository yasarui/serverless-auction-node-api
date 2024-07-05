const Joi = require('joi');

const getAllAuctionsSchema = Joi.object({
    status: Joi.string().valid('open', 'closed').insensitive().required()
})

const createAuctionSchema = Joi.object({
    title: Joi.string().min(3).max(100).required()
});

const updateAuctionSchema = Joi.object({
    amount: Joi.number().required()
})

module.exports = {
    getAllAuctionsSchema,
    createAuctionSchema,
    updateAuctionSchema
}