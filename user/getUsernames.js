/**
 * Route:  GET /usernames
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let params = {
			TableName: process.env.JOURNALS_TABLE,
			ExpressionAttributeNames: {
				'#pk': 'pk',
				'#sk': 'sk',
			},
			ExpressionAttributeValues: {
				':pk': 'USERNAMES#',
				':sk': 'SET#',
			},
			KeyConditionExpression: '#pk = :pk and #sk = :sk',
		};

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
