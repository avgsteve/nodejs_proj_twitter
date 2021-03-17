// const request = require('supertest');
// const { it, expect } = require('@jest/globals');
import request from 'supertest'

// @ts-ignore
const app = require('./../../../../app')

// jest.mock('../../nats-wrapper.ts');

it('測試使用者登入的功能', async () => {

  const responseSignUp = await request(app).post('/register').send({
    "firstName": "steve",
    "lastName": "leng",
    "userName": "test1234545645",
    "email": "sl@gmail.com",
    "password": "1232342342351345"
  });


  expect(responseSignUp.status).toEqual(201); // 因為將沒有登入的使用者轉向至 


  const responseLogin = await request(app).post('/login').send({
    "account": responseSignUp.body.userName,
    "password": "1232342342351345"
  });

  expect(responseLogin.status).toEqual(200);

  console.log('登入成功，Cookie: ', responseLogin.get('Set-Cookie'));
  // 確認有透過後端取得cookie
  expect(responseLogin.get('Set-Cookie')).toBeDefined();

});

