/**
 * Route: PATCH /user
 * 프로필 업데이트
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        let user_id = util.getUserId(event.headers);
        let params = {
            TableName: process.env.JOURNALS_TABLE,
            Key: {
                pk: 'USER#' + user_id,
                sk: 'PROFILE#' + user_id,
            },
            ExpressionAttributeNames: {
                '#p': 'profile',
            },
            ExpressionAttributeValues: {
                ':profile': item.profile,
            },
            UpdateExpression: 'SET #p = :profile',

            ReturnValues: 'ALL_NEW',
        };

        await dynamodb.update(params).promise();

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(item),
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
