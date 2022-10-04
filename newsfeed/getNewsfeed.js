/**
 * Route: GET /newsfeed
 * 뉴스피드 호출
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const _ = require('lodash');
const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let query = event.queryStringParameters;
		// 날짜 또는 좋아요 수에 따라 정렬 하기 위한 변수
		let sortBy = query && 'sortBy' in query ? query.sortBy : 'date';
		// 최소 좋아요 설정 변수
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
			};
		}

		let data = await dynamodb.query(params).promise();

		return {
			statusCode: 200,
			headers: util.getResponseHeaders(),
			body: JSON.stringify(data.Items),
		};
	} catch (e) {
        console.log('Error', e);
        return {
            statusCode: e.statusCode,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: e.name,
                message: e.message,
            }),
        };
	}
};
