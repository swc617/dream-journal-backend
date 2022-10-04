/**
 * Route: PATCH /journal/{sk}
 * 일지 업데이트
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        let user_id = util.getUserId(event.headers);
        let date_id = decodeURIComponent(event.pathParameters.sk);
        let query = event.queryStringParameters;
        // 공개일지를 비공개로 설정하기 위한 변수
        let makePrivate =
            query && 'makePrivate' in query ? query.makePrivate : undefined;
        // 비공개 일지를 공개 일지로 설정하기 위한 변수
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

        // 두개 설정을 같이 사용할 수 없음
        if (makePrivate && makePublic) {
            throw new Error(
                'makePrivate and makePublic cannot be used together'
            );
        }

        // 비공개로 설정할 경우 댓글, 좋아요, 좋아한 아이디 목록 삭제
        if (makePrivate) {
            updateShare = ',#s=:share REMOVE votes, likedby, comments';
            params.ExpressionAttributeNames['#s'] = 'share';
            params.ExpressionAttributeValues[':share'] = 'PRIVATE';
        }
        // 공개로 설정할 경우 기본 설정
        // 자신의 포스트 좋아요로 설정 -> 좋아요 수를 1로 설정
        // 댓글은 더미로 _ 추가
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
