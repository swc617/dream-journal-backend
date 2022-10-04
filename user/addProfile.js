/**
 * Route: POST /user
 * 프로필 생성
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        let user_id = util.getUserId(event.headers);
        let profile_id = user_id;
        item.pk = 'USER#' + user_id;
        item.sk = 'PROFILE#' + profile_id;

        let data = await dynamodb
            .put({
                TableName: process.env.JOURNALS_TABLE,
                Item: item,
            })
            .promise();

        return {
            statusCode: 201,
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
