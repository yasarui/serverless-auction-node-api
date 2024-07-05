require('dotenv').config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

async function closeAuction(auction){
   const params = {
    TableName: process.env.AUCTIONS_TABLE,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
   }

   try {
     const command = new UpdateCommand(params);
     const { result } = await docClient.send(command);
     return result;
   }catch (error){
      return error;
   }
}

module.exports = closeAuction;