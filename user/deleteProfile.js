/**
 * Route: DELETE /user
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let user_id = util.getUserId(event.headers);

		let params = {
			TableName: process.env.JOURNALS_TABLE,
			TableName: process.env.JOURNALS_TABLE,
			Key: {
				pk: 'USER#' + user_id,
				sk: 'PROFILE#' + user_id,
			},

			KeyConditionExpression: '#pk = :user_id and begins_with(#sk, :sk)',
		};

		await dynamodb.delete(params).promise();

		return {
			statusCode: 204,
			headers: util.getResponseHeaders(),
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
