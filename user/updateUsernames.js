/**
 * Route: PATCH /usernames
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let item = JSON.parse(event.body).Item;
		let params = {
			TableName: process.env.JOURNALS_TABLE,
			Key: {
				pk: 'USERNAMES#',
				sk: 'SET#',
			},
			ExpressionAttributeValues: {
				':newUsername': dynamodb.createSet([item.username]),
			},
			UpdateExpression: 'ADD usernames :newUsername',

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
