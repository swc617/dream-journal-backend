/**
 * Route: GET /journals
 * 일지 목록
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        let query = event.queryStringParameters;
        // 페이지 리밋 변수
        let limit = query && 'limit' in query ? parseInt(query.limit) : 20;
        // 페이지 시작 변수
        let pageStart =
            query && 'pageStart' in query ? query.pageStart : undefined;
        // 날짜 구간 시작 변수
        let startDate =
            query && 'startDate' in query ? query.startDate : undefined;
        // 날짜 구간 끝 변수
        let endDate = query && 'endDate' in query ? query.endDate : undefined;
        // theme, type 등 projection을 나타내는 변수
        let projections =
            query && 'projections' in query ? query.projections : undefined;
        // 사용자 지정 테마 변수
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

        // 페이지 시작점
        if (pageStart) {
            params.ExclusiveStartKey = {
                pk: 'USER#' + user_id,
                sk: 'ENTRY#' + pageStart,
            };
        }

        // 날짜 구간 설정
        if (startDate) {
            params.KeyConditionExpression =
                'pk = :user_id and \
			sk >= :start_date';
            params.ExpressionAttributeValues[':start_date'] =
                'ENTRY#' + startDate;
        }
        if (endDate) {
            params.KeyConditionExpression =
                'pk = :user_id and \
			sk <= :end_date';
            params.ExpressionAttributeValues[':end_date'] = 'ENTRY#' + endDate;
        }
        if (startDate && endDate) {
            params.KeyConditionExpression =
                'pk = :user_id and \
			sk between :start_date and :end_date';
            params.ExpressionAttributeValues[':start_date'] =
                'ENTRY#' + startDate;
            params.ExpressionAttributeValues[':end_date'] = 'ENTRY#' + endDate;
        }

        // 프로젝션 설정
        if (projections) {
            params.ProjectionExpression = projections;
        }

        // 사용자 지정 테마
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
