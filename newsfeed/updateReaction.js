/**
 * Route: PATCH /newsfeed/{sk}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const _ = require('lodash');
const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let query = event.queryStringParameters;

		let user_id = util.getUserId(event.headers);
		let date_id = decodeURIComponent(event.pathParameters.sk);
		let item = JSON.parse(event.body).Item;

		let params = {
			TableName: process.env.JOURNALS_TABLE,
			IndexName: 'gs1',
			Key: {
				pk: 'USER#' + user_id,
				sk: 'ENTRY#' + date_id,
			},
			ExpressionAttributeValues: {
				':votes': item.votes,
				':likedby': item.likedby,
				':comments': item.comments,
			},
			UpdateExpression:
				'SET votes = :votes, likedby = :likedby, comments = :comments',
			ReturnValues: 'ALL_NEW',
		};

		let data = await dynamodb.update(params).promise();

		return {
			statusCode: 200,
			headers: util.getResponseHeaders(),
			body: JSON.stringify(data),
		};
	} catch (err) {
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
