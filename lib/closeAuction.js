require("dotenv").config();
const AWS = require("aws-sdk");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

// Create an SQS service object
var sqs = new AWS.SQS({ apiVersion: "2012-11-05", region: "us-east-1"  });

async function closeAuction(auction) {

  console.log("This function is working");

  const params = {
    TableName: process.env.AUCTIONS_TABLE,
    Key: { id: auction.id },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": "CLOSED",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  try {
    const command = new UpdateCommand(params);
    await docClient.send(command);
    const { title, seller, highestBid } = auction;
    const { amount, bidder } = highestBid;

    const notifySeller = sqs
      .sendMessage({
        QueueUrl:
          "https://sqs.us-east-1.amazonaws.com/428575618622/myMailQueue",
        MessageBody: JSON.stringify({
          subject: "Your item has been sold!",
          recipient: seller,
          body: `Woohoo! Your itme "${title}" has been sold for $${amount}.`,
        }),
      })
      .promise();

    const notifyBidder = sqs
      .sendMessage({
        QueueUrl:
          "https://sqs.us-east-1.amazonaws.com/428575618622/myMailQueue",
        MessageBody: JSON.stringify({
          subject: "You won an auction!",
          recipient: bidder,
          body: `What a great deal! You got yourself a "${title}" for $${amount}.`,
        }),
      })
      .promise();

    console.log({ notifySeller, notifyBidder });

    return Promise.all([notifySeller, notifyBidder]);
  } catch (error) {
    return error;
  }
}

module.exports = closeAuction;
