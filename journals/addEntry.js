/**
 * Route: POST /journal
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const { v4: uuidv4 } = require('uuid');
const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let item = JSON.parse(event.body).Item;
		let createdAt = new Date().toJSON().slice(0, 10).replace(/-/g, '');
		let user_id = util.getUserId(event.headers);
		let date_id = createdAt + '::' + uuidv4();
		item.pk = 'USER#' + user_id;
		item.sk = 'ENTRY#' + date_id;
		if (item.share === 'PUBLIC') {
			item.votes = 1;
			item.likedby = dynamodb.createSet([user_id]);
			item.comments = [{ username: '_', comment: '_' }];
		}
		item.journal_id = user_id + '::' + uuidv4();

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
