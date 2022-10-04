/**
 * Route: GET /types
 * 꿈 타입별 일지 호출
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.JOURNALS_TABLE;

exports.handler = async (event) => {
    try {
        let query = event.queryStringParameters;
        // 역순 설정 변수
        let reverse = query && 'reverse' in query ? query.reverse : false;
        // 꿈 타입 변수
        let type = query && 'type' in query ? query.type : undefined;
        let user_id = util.getUserId(event.headers);

        let params = {
            TableName: tableName,
            IndexName: 'ls1',
            KeyConditionExpression: 'pk = :user_id',
            ExpressionAttributeValues: {
                ':user_id': 'USER#' + user_id,
            },
            ScanIndexForward: reverse,
        };

        // 타입의 일지 설정
        if (type) {
            params.KeyConditionExpression = 'pk = :user_id and #t = :t';
            params.ExpressionAttributeNames = { '#t': 'type' };
            params.ExpressionAttributeValues[':t'] = type;
        }

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
