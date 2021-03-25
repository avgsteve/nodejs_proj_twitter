# SNS (Social Network Service) Project
## Link: [http://128.199.143.55:3003/login](http://128.199.143.55:3003/login)

### Test Accounts: 
    user name: test2 to test10 
    password: same as user name

#### Important: 
  - 🔴 Please note that this project is for the purpose of STUDY and CODE DEMO


1. Skill Stacks for this project:
     1. JavaScript + jQuery
     2. HTML, CSS and Bootstrap
     3. Node.js
     4. MongoDB
     5. ✔️ Ubuntu & PM2 (for web hosting)
    
     (Note: Might try nginx & docker if I have spare time later...)

2. Features:
     1. Socket.IO
        Real-time, bidirectional and event-based communication
     2. Photo cropping & uploading
     3. ✔️ Sending e-mail notification for user's account activation & password resetting
     4. ✔️ Scheduled Jobs for fetching statistic data from database regularly
     5. ✔️ MVC design pattern for front-end functions
   
3. Functions:
    1. User and account control
       1. ✔️ Account activation
       2. ✔️ Password reset with e-mail 
       3. ✔️ Identifying user with Cookie & JWT 
       4. ✔️ Account role control 
    2. Message Sending as chat room
    3. Real-time chat message and notification
    4. Post of text content, ✔️ photo and "like" , "retweet" and "reply" functions
    5. Post and User search
    6. ✔️ Code Testing with Jest (for API endpoints) 
    7. ✔️ Code bundling & compression (front-end JavaScript files) 
    8. ✔️ Some UI/UX tweaks: loading effect, responsive design, animation etc,. 
    
    (note: ✔️ mark means the extra feature & function I've added to the original code from Udemy course)

4. To Do:
   1. Image uploading on S3 storage
   2. Admin page

5. Links to code:

    #### (Please see readMe file in each page for more detail)
  - Backend
    
     1. Server Setup
        1. [API and front page routes](https://github.com/avgsteve/nodejs_proj_twitter/blob/b14866b5aae262329a8e9818302e2a4273ab6145/server/app.js#L72)
        2. [Error Handling](https://github.com/avgsteve/nodejs_proj_twitter/tree/main/server/routes/errorHandlers)
           1. [Request validation(express-validator)](https://github.com/avgsteve/nodejs_proj_twitter/blob/main/server/routes/errorHandlers/checkReqValidationErrors.js)
           2. [Handlers for different backend error](https://github.com/avgsteve/nodejs_proj_twitter/blob/main/server/routes/errorHandlers/routeNotFoundHandler.js)
           3. [Customized Error Class for global error handling and outputting](https://github.com/avgsteve/nodejs_proj_twitter/blob/main/server/routes/errorHandlers/customError.js)
     2. [MongoDB (noSQL data) schema](https://github.com/avgsteve/nodejs_proj_twitter/tree/main/server/database/schemas)
     3. Cron Jobs setup


  - Frontend

      1. [HTML(templates)](https://github.com/avgsteve/nodejs_proj_twitter/tree/main/views)
      2. User login, register, activation, password reset
      3. ✅ Post create and render
      4. ✅ Chat Page (chat list, user search)
      5. ✅ Search page (for post and user)
      6. ✅ User profile : following and followers
      7. ✅ Notification
      8. Socket.io event emitter and receiver (for event handling)
      9. Image cropper   
      ####  ✅ means MVC pattern


6. Reference:

  1. Udemy Course: [Create a Twitter Clone with Node.js, Socket.IO and MongoDB by Reece Kenney ](https://www.udemy.com/course/create-a-twitter-clone-with-nodejs-socketio-and-mongodb/learn/lecture/23305854?start=15#overview)