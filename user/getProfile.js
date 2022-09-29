/**
 * Route: GET /user
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const _ = require('lodash');
const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let user_id = util.getUserId(event.headers);
		let params = {
			TableName: process.env.JOURNALS_TABLE,
			ExpressionAttributeNames: {
				'#pk': 'pk',
				'#sk': 'sk',
			},
			ExpressionAttributeValues: {
				':user_id': 'USER#' + user_id,
				':sk': 'PROFILE#',
			},
			KeyConditionExpression: '#pk = :user_id and begins_with(#sk, :sk)',
		};

		console.log(params);

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
