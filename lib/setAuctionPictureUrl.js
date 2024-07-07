const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    UpdateCommand
  } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

async function setAuctionPictureUrl(id, pictureUrl) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE,
    Key: { id },
    UpdateExpression: 'set pictureUrl = :pictureUrl',
    ExpressionAttributeValues: {
      ':pictureUrl': pictureUrl,
    },
    ReturnValues: 'ALL_NEW',
  };

  try{
    const command = new UpdateCommand(params);
    const { Attributes } = await docClient.send(command);
    return Attributes;
  } catch (error) {
    throw new createError.InternalServerError('Could not update the picture url');
  }
}

module.exports = setAuctionPictureUrl