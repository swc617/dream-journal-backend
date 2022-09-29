/**
 * Route: GET /journal/{sk}
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
		console.log(user_id);
		console.log(date_id);
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
