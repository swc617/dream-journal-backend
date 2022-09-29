/**
 * Route: PATCH /user
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
