/**
 * Route: PATCH /journal/{sk}
 */

const AWS = require('aws-sdk');
const { stubFalse } = require('lodash');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let item = JSON.parse(event.body).Item;
		let user_id = util.getUserId(event.headers);
		let date_id = decodeURIComponent(event.pathParameters.sk);
		let query = event.queryStringParameters;
		// makePrivate will remove votes,likedby, & comments from entry
		// makePublic will initialize votes, likedby, & comments to zero
		let makePrivate =
			query && 'makePrivate' in query ? query.makePrivate : undefined;
		let makePublic =
			query && 'makePublic' in query ? query.makePublic : undefined;
		const baseUpdateExpression =
			'SET title = :title, content = :content, theme = :theme, #t = :type,\
		sleeptime = :sleeptime, mood = :mood, vividness = :vividness';
		let updateShare = '';

		let params = {
			TableName: process.env.JOURNALS_TABLE,
			Key: {
				pk: 'USER#' + user_id,
				sk: 'ENTRY#' + date_id,
			},
			ExpressionAttributeNames: {
				'#t': 'type',
			},
			ExpressionAttributeValues: {
				':title': item.title,
				':content': item.content,
				':theme': item.theme,
				':type': item.type,
				':sleeptime': item.sleeptime,
				':mood': item.mood,
				':vividness': item.vividness,
			},

			ReturnValues: 'ALL_NEW',
		};

		// make private and make public cannot be used together
		if (makePrivate && makePublic) {
			throw new Error('makePrivate and makePublic cannot be used together');
		}

		if (makePrivate) {
			updateShare = ',#s=:share REMOVE votes, likedby, comments';
			params.ExpressionAttributeNames['#s'] = 'share';
			params.ExpressionAttributeValues[':share'] = 'PRIVATE';
		}
		if (makePublic) {
			updateShare =
				',#s = :share, votes = :votes, likedby=:likedby, comments = :comments';
			params.ExpressionAttributeNames['#s'] = 'share';
			params.ExpressionAttributeValues[':share'] = 'PUBLIC';
			params.ExpressionAttributeValues[':votes'] = 1;
			params.ExpressionAttributeValues[':likedby'] = dynamodb.createSet([
				user_id,
			]);
			params.ExpressionAttributeValues[':comments'] = [
				{ username: '_', comment: '_' },
			];
		}

		params.UpdateExpression = baseUpdateExpression + updateShare;

		let data = await dynamodb.update(params).promise();

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
