/**
 * Route:  GET /usernames
 * 아이디 목록 호출
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        let params = {
            TableName: process.env.JOURNALS_TABLE,
            ExpressionAttributeNames: {
                '#pk': 'pk',
                '#sk': 'sk',
            },
            ExpressionAttributeValues: {
                ':pk': 'USERNAMES#',
                ':sk': 'SET#',
            },
            KeyConditionExpression: '#pk = :pk and #sk = :sk',
        };

        let data = await dynamodb.query(params).promise();

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(data.Items),
        };
    } catch (e) {
        console.log('Error', e);
        return {
            statusCode: e.statusCode,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: e.name,
                message: e.message,
            }),
        };
    }
};
