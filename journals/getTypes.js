/**
 * Route: GET /types
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.JOURNALS_TABLE;

exports.handler = async (event) => {
	try {
		let query = event.queryStringParameters;
		let reverse = query && 'reverse' in query ? query.reverse : false;
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
	} catch (err) {
		console.log('Error', err);
		return {
			statusCode: err.statusCode ? err.statusCode : 500,
			headers: util.getResponseHeaders(),
			body: JSON.stringify({
				error: err.name ? err.name : 'Exception',
				message: err.message ? err.message : 'Unknown error',
			}),
		};
	}
};
