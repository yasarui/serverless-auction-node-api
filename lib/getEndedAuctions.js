require('dotenv').config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

async function getEndedAuctions(){
    const now = new Date();
    const params = {
        TableName: process.env.AUCTIONS_TABLE,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endingAt <= :now',
        ExpressionAttributeValues: {
            ':status': 'OPEN',
            ':now':  now.toISOString(),
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    }
    try{
        const command = new QueryCommand(params);
        const { Items } = await docClient.send(command);
        return Items;
    }catch(error){
        return error;
    }

}

module.exports = getEndedAuctions