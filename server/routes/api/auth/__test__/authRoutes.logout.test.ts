// import request from 'supertest';
// import { it, expect } from '@jest/globals';
import request from 'supertest'

// @ts-ignore
const app = require('./../../../../app')

// jest.mock('../../nats-wrapper.ts');

it('測試使用者登出的功能', async () => {

  const responseSignUp = await request(app).post('/register').send({
    "firstName": "steve",
    "lastName": "leng",
    "userName": "test1234545645",
    "email": "sl@gmail.com",
    "password": "1232342342351345"
  });

  expect(responseSignUp.status).toEqual(201); // 因為將沒有登入的使用者轉向至 

  // 確認有透過後端取得cookie
  expect(responseSignUp.get('Set-Cookie')[0]).toContain('jwtCookie=');

  const responseLogout = await request(app).get('/logout');
  expect(responseLogout.status).toEqual(302); // will be redirected

  expect(responseLogout.get('Set-Cookie')[0])
    .toContain('jwtCookie=loggedOut');

});

