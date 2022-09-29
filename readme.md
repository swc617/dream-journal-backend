# Sharedream 백엔드

꿈 기록일지 공유 할 수 있는 웹앱 백엔드 구성.

Serverless, DynamoDB, Lambda, API Gateway

requirements

- AWS 계정

Codecommit repository 설정 후

```console
npm install
git push
sls deploy
```
## 데이터베이스 구조
싱글 테이블 디자인 - [스키마](https://docs.google.com/spreadsheets/d/1EIfkwCDx7B179JQYg06WFV6aem76h1bnVptbW779h7w/edit?usp=sharing)
Primary Key<br>
* pk - partition key
* sk - sorting key

Secondary Indexes<br>
* ls1 - local secondary index
  사용자의 일지를 꿈의 타입에 따라 호출
  * pk - hash
  * type - range
* gs1 - global secondary index
  share 속성이 public인 일지를 좋아요에 따라 호출
  * share - hash
  * votes - range 
  share가 public한 일지를 종
* gs2 - global secondary index
  share 속성이 public인 일지를 날짜에 따라 호출
  * share - hash
  * sk - range


## 라우트
journals
└──addEntry -- POST 일지
   deleteEntry -- DELETE 일지
   getEntries -- GET 모든 일지
   getEntry -- GET 일지
   getTypes -- GET 타입별 일지; (ls1) 사용
   updateEntry -- PATCH 일지<br>

newsfeed
└──getNewsfeed -- GET 모든 사용자 일지; (gs1, gs2) 사용
   updateReaction -- PATCH 댓글, 좋아요<br>

user
└──addProfile -- POST 프로필
   deleteProfile -- DELETE 프로필
   getProfile -- GET 프로필
   getUsernames -- GET 모든 아이디; 아이디 중복 확인용
   updateProfile -- PATCH 프로필
   updateUsernames -- PATCH 아이디 set에 추가; 아이디 중복 확인용
│
