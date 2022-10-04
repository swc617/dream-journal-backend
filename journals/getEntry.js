/**
 * Route: GET /journal/{sk}
 * 일지 호출
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const _ = require('lodash');
const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        let user_id = util.getUserId(event.headers);
        let date_id = decodeURIComponent(event.pathParameters.sk);
        let params = {
            TableName: process.env.JOURNALS_TABLE,
            Key: {
                pk: 'USER#' + user_id,
                sk: 'ENTRY#' + date_id,
            },
        };

        let data = await dynamodb.get(params).promise();

        if (_.isEmpty(data)) {
            return {
                statusCode: 404,
                headers: util.getResponseHeaders(),
            };
        } else {
            return {
                statusCode: 200,
                headers: util.getResponseHeaders(),
                body: JSON.stringify(data.Item),
            };
        }
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
