/**
 * Route: POST /user
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const { v4: uuidv4 } = require('uuid');
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
