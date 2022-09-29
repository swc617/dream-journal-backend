/**
 * Route: GET /newsfeed
 *
 * if date isn't specified it will get current year month newsfeeds
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const _ = require('lodash');
const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let query = event.queryStringParameters;
		let sortBy = query && 'sortBy' in query ? query.sortBy : 'date';
		let voteMin =
			query && 'voteMinimum' in query ? parseInt(query.voteMinimum) : 0;
		let currDate = new Date().toJSON().slice(0, 7).replace(/-/g, '');
		let date = query && 'date' in query ? query.date : currDate;

		let params = {};

		if (sortBy == 'date') {
			params = {
				TableName: process.env.JOURNALS_TABLE,
				IndexName: 'gs2',
				KeyConditionExpression: '#s = :public and begins_with(sk, :date)',
				ExpressionAttributeNames: {
					'#s': 'share',
				},
				ExpressionAttributeValues: {
					':public': 'PUBLIC',
					':date': 'ENTRY#' + date,
				},
				// Limit: 20,
			};
		} else if (sortBy == 'votes') {
			params = {
				TableName: process.env.JOURNALS_TABLE,
				IndexName: 'gs1',
				KeyConditionExpression: '#s = :public and #v >= :v',
				ExpressionAttributeNames: {
					'#s': 'share',
					'#v': 'votes',
				},
				ExpressionAttributeValues: {
					':public': 'PUBLIC',
					':v': voteMin,
				},
				// Limit: 20,
			};
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
