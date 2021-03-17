import request from 'supertest'

const User = require('../../../../database/schemas/UserSchema.js');

import { it, expect } from '@jest/globals';
const app = require('../../../../app');

// jest.mock('../../nats-wrapper.ts');

const signupAndLogin = async (name: string) => {

  const responseSignUp = await request(app).post('/register').send({
    "firstName": "test user",
    "lastName": `${name}`,
    "userName": `${name}123`,
    "email": `${name}123@gmail.com`,
    "password": `${name}1234`
  });
  return responseSignUp;

};

it('測試建立新文章 POST@/api/posts', async () => {

  const responseFromLogin = await signupAndLogin('steve');

  const newPostDataResponse = await request(app)
    .post('/api/posts')
    // 從 responseFromLogin 取得 Cookie，設定在post環境中
    .set('Cookie', responseFromLogin.get('Set-Cookie'))
    .send({
      post_content: 'random post content',
      postedBy: `${responseFromLogin.body._id}`
    })
    .expect(201);

  // console.log('文章建立成功:', newPostDataResponse.body);
}
);


it('測試讀取所有文章 GET@/api/posts', async () => {

  const responseFromLogin = await signupAndLogin('steve');

  const newPostDataResponse = await request(app)
    .post('/api/posts')
    .set('Cookie', responseFromLogin.get('Set-Cookie'))
    .send({
      post_content: 'random post content',
      postedBy: `${responseFromLogin.body._id}`
    })
    .expect(201);

  // console.log('newPostDataResponse.body:\n', newPostDataResponse.body);

  const getAllPostDataResponse = await request(app)
    .get('/api/posts')
    .set('Cookie', responseFromLogin.get('Set-Cookie'))
    .expect(200);

  // console.log('getAllPostDataResponse.body[0]:\n', getAllPostDataResponse.body[0]);

  expect(getAllPostDataResponse.body[0]._id)
    .toEqual(newPostDataResponse.body._id);

  // 測試 新文章的作者id 符合 搜尋到的文章的作者id
  expect(getAllPostDataResponse.body[0].postedBy._id)
    .toEqual(newPostDataResponse.body.postedBy._id);


}
);


it('測試: 使用文章id讀取文章 GET@/api/posts/:id ', async () => {

  const responseFromLogin = await signupAndLogin('steve');

  const newPostDataResponse = await request(app)
    .post('/api/posts')
    .set('Cookie', responseFromLogin.get('Set-Cookie'))
    .send({
      post_content: 'random post content',
      postedBy: `${responseFromLogin.body._id}`
    })
    .expect(201);

  // console.log('newPostDataResponse.body:\n', newPostDataResponse.body);

  const getPostByIdResponse = await request(app)
    .get(`/api/posts/${newPostDataResponse.body._id}`)
    .set('Cookie', responseFromLogin.get('Set-Cookie'))
    .expect(200);

  // console.log('getPostByIdResponse.body:\n', getPostByIdResponse.body.postData);

  // 測試 新建立文章 與 使用文章id查詢到的文章相符 (使用文章在資料庫的id做比對)
  expect(getPostByIdResponse.body.postData._id)
    // 注意:   這裡 ↑↑↑↑↑↑ 要用 body.postData.id 而不是直接 用 body._id  
    .toEqual(newPostDataResponse.body._id);
}
);

it('測試: 對文章按讚(like) 和收回讚 GET@/api/posts/:id/like ', async () => {

  const user1 = await signupAndLogin('steve');
  const user2 = await signupAndLogin('mary');

  // 透過第一個帳號建立新post資料
  const { body: newPost } = await request(app)
    .post('/api/posts')
    .set('Cookie', user1.get('Set-Cookie'))
    .send({
      post_content: 'random post content',
      postedBy: `${user1.body._id}`
    })
    .expect(201);

  // console.log('newPost:\n', newPost);

  //  user 2對新post資料按讚
  const { body: likePostByIdResponse } = await request(app)
    .put(`/api/posts/${newPost._id}/like`)
    .set('Cookie', user2.get('Set-Cookie'))
    .expect(200);

  // console.log('likePostByIdResponse.body:\n', likePostByIdResponse);

  // 確認被按讚的文章裡面 包含 進行按讚的人(user 2)的id
  expect(likePostByIdResponse.likes[0])
    .toEqual(user2.body._id);

  // 確認user 2資料裡面有按過讚的文章id
  const userLikedPost = await User.findOne({
    _id: user2.body._id,
    likes: likePostByIdResponse._id
  });
  // 因為存在 likes Array 裡面的 id 是 MongoDB 的 ObjectId物件，所以要轉成string才能進行比對
  expect(userLikedPost.likes[0].toString()).toEqual(newPost._id);


  // 測試再對同一篇文章按一次讚就會把讚收回
  const { body: likePostByIdAgain } = await request(app)
    .put(`/api/posts/${newPost._id}/like`)
    .set('Cookie', user2.get('Set-Cookie'))
    .expect(200);

  // console.log('被按過第二次讚的文章: ', likePostByIdAgain);

  expect(likePostByIdAgain.likes.length)
    .toEqual(0);

  // 確認user 2資料裡面已經沒有按過讚的文章id
  const userLikedPostAgain = await User.findOne({
    _id: user2.body._id,
    likes: likePostByIdResponse._id // 如果likes裡面沒有文章的id，查詢結果會變成null
  });
  expect(userLikedPostAgain).toEqual(null);

}
);