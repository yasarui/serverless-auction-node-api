const { DynamoDBClient,  } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  QueryCommand
} = require("@aws-sdk/lib-dynamodb");
const createError = require('http-errors');
const uploadPictureToS3 = require('../lib/uploadPictureToS3');
const setAuctionPictureUrl = require('../lib/setAuctionPictureUrl');
const moment = require("moment");
const { v4: uuid } = require("uuid");


const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const AUCTIONS_TABLE = process.env.AUCTIONS_TABLE;

const getAllAuctions = async (status) => {
  const params = {
    TableName: AUCTIONS_TABLE,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeValues: {
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };
  try {
    const command = new QueryCommand(params);
    const { Items } = await docClient.send(command);
    return Items;
  } catch (error) {
    throw new createError.InternalServerError("Could not retrieve auctions");
  }
};

const findAuctionById = async (id) => {
  let auction;
  const params = {
    TableName: AUCTIONS_TABLE,
    Key: {
      id: id,
    },
  };
  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    auction = Item;
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
  if(!auction){
    throw new createError.NotFound(`Auction with ID "${id}" not found!`);
  }
  return auction;
};

const getAuction = async (auctionId) => {
  return await findAuctionById(auctionId);
};

const createAuction = async (title, email) => {
  const createdAt = new Date().toISOString();
  const endDate = new Date();
  endDate.setHours(new Date().getHours() + 1) 
  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt,
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0
    },
    seller: email
  };
  const params = {
    TableName: AUCTIONS_TABLE,
    Item: auction,
  };
  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    return auction;
  } catch (error) {
    throw new createError.InternalServerError("Could not create auction");
  }
};

const updateAuction = async (id, amount, email) => {
  const auction = await findAuctionById(id);

  // Seller itself cant bid on his auction
  if(auction.seller === email){
    throw new createError.Forbidden(`You Cant bid on your own auction`);
  }

  // Bidder cant bid twice
  if(auction.highestBid.bidder === email){
    throw new createError.Forbidden(`You are the highest bidder already`);
  }

  // Bid Amount Validation
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
  }

  // Auction Status Validation
  if(auction.status === 'CLOSED') {
    throw new createError.Forbidden(`You cannot bid on the closed auction`);
  }

  const params = {
    TableName: AUCTIONS_TABLE,
    Key: {
      id
    },
    UpdateExpression: "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email
    },
    ReturnValues: "ALL_NEW"
  }
  try {
    const command = new UpdateCommand(params);
    const { Attributes } = await docClient.send(command);
    return Attributes;
  } catch (error) {
    throw new createError.InternalServerError('Could not update highest bid amount');
  }
};

const updateAuctionPicture = async (id, email, imgBuffer) => {
  const auction = await findAuctionById(id);

  // Only seller can update the picture
  if(auction.seller !== email){
    throw new createError.Forbidden(`You are not the seller of this auction!`);
  }

  let updatedAuction;
  try {
    const pictureUrl = await uploadPictureToS3(auction.id + '.jpg', imgBuffer);
    updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
    return updateAuction
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

module.exports = {
  getAllAuctions,
  getAuction,
  createAuction,
  updateAuction,
  updateAuctionPicture
};
