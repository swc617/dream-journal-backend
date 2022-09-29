/**
 * Route: DELETE /journals/{date_id}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

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
