/**
 * Route: PATCH /usernames
 * 아이디 목록에 새로운 아이디 추가
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        let params = {
            TableName: process.env.JOURNALS_TABLE,
            Key: {
                pk: 'USERNAMES#',
                sk: 'SET#',
            },
            ExpressionAttributeValues: {
                ':newUsername': dynamodb.createSet([item.username]),
            },
            UpdateExpression: 'ADD usernames :newUsername',

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
