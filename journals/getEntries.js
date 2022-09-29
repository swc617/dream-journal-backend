/**
 * Route: GET /journals
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	try {
		let query = event.queryStringParameters;
		let limit = query && 'limit' in query ? parseInt(query.limit) : 20;
		let pageStart = query && 'pageStart' in query ? query.pageStart : undefined;
		let startDate = query && 'startDate' in query ? query.startDate : undefined;
		let endDate = query && 'endDate' in query ? query.endDate : undefined;
		let projections =
			query && 'projections' in query ? query.projections : undefined;
		let theme = query && 'theme' in query ? query.theme : undefined;
		let user_id = util.getUserId(event.headers);

		let params = {
			TableName: process.env.JOURNALS_TABLE,
			KeyConditionExpression: 'pk = :user_id',
			ExpressionAttributeValues: {
				':user_id': 'USER#' + user_id,
			},
			Limit: limit,
		};

		// specify where to start if paginated
		if (pageStart) {
			params.ExclusiveStartKey = {
				pk: 'USER#' + user_id,
				sk: 'ENTRY#' + pageStart,
			};
		}

		// add date range
		if (startDate) {
			params.KeyConditionExpression = 'pk = :user_id and \
			sk >= :start_date';
			params.ExpressionAttributeValues[':start_date'] = 'ENTRY#' + startDate;
		}
		if (endDate) {
			params.KeyConditionExpression = 'pk = :user_id and \
			sk <= :end_date';
			params.ExpressionAttributeValues[':end_date'] = 'ENTRY#' + endDate;
		}
		if (startDate && endDate) {
			params.KeyConditionExpression =
				'pk = :user_id and \
			sk between :start_date and :end_date';
			params.ExpressionAttributeValues[':start_date'] = 'ENTRY#' + startDate;
			params.ExpressionAttributeValues[':end_date'] = 'ENTRY#' + endDate;
		}

		// choose projections
		if (projections) {
			params.ProjectionExpression = projections;
		}

		if (theme) {
			params.FilterExpression = 'theme = :theme';
			params.ExpressionAttributeValues[':theme'] = theme;
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
