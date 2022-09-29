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
싱글 테이블 디자인 - [스키마](https://docs.google.com/spreadsheets/d/1EIfkwCDx7B179JQYg06WFV6aem76h1bnVptbW779h7w/edit?usp=sharing)<br>
Primary Key<br>
* pk - partition key
* sk - sorting key

Secondary Indexes<br>
* ls1 - local secondary index<br>
  사용자의 일지를 꿈의 타입에 따라 호출<br>
  * pk - hash
  * type - range
* gs1 - global secondary index<br>
  share 속성이 public인 일지를 좋아요에 따라 호출<br>
  * share - hash
  * votes - range 
* gs2 - global secondary index<br>
  share 속성이 public인 일지를 날짜에 따라 호출<br>
  * share - hash
  * sk - range

그 외 속성<br>
* profile - 프로필
* title - 제목
* content - 내용
* mood - 무드
* vividness - 생생함
* sleeptime - 수면시간
* type - 꿈의 타입 (normal, 
* theme - 사용자 지정 테마
* share - 공유 여부
* journal_id - 일기식별번호
* votes - 좋아요수
* liked_by - 좋아요 누른 사용자 
* comments - 댓글


## 라우트
<pre>
journals<br>
└──addEntry -- POST 일지<br>
   deleteEntry -- DELETE 일지<br>
   getEntries -- GET 모든 일지<br>
   getEntry -- GET 일지<br>
   getTypes -- GET 타입별 일지; (ls1) 사용<br>
   updateEntry -- PATCH 일지<br>
<br>
newsfeed<br>
└──getNewsfeed -- GET 모든 사용자 일지; (gs1, gs2) 사용<br>
   updateReaction -- PATCH 댓글, 좋아요<br>
<br>
user<br>
└──addProfile -- POST 프로필<br>
   deleteProfile -- DELETE 프로필<br>
   getProfile -- GET 프로필<br>
   getUsernames -- GET 모든 아이디; 아이디 중복 확인용<br>
   updateProfile -- PATCH 프로필<br>
   updateUsernames -- PATCH 아이디 set에 추가; 아이디 중복 확인용<br>
</pre>
