// const request = require('supertest');
import request from 'supertest'

// @ts-ignore
const User = require('../../../../database/schemas/UserSchema.js');
// import { it, expect } from '@jest/globals';
// import { response } from 'express';

// @ts-ignore
const app = require('../../../../../server/app');

// jest.mock('../../nats-wrapper.ts');


it('測試未登入使用者會被轉至 /login ', async () => {
  let serverResponse = await request(app).get('/');
  console.log(`response.status: ${serverResponse.status}`);
  expect(serverResponse.status).toEqual(302); // 因為將沒有登入的使用者轉向至
});

it('測試 /api/users/register 註冊使用者的功能', async () => {

  const newUserData = {
    firstName: "steve",
    lastName: "leng",
    userName: "test1234545645",
    email: "sl@gmail.com",
    password: "1232342342351345"
  }

  const serverResponse = await request(app).post('/api/users/register').send(newUserData);

  expect(serverResponse.status).toEqual(201);

  const newUserResult = JSON.parse(serverResponse.text)
  console.log(newUserResult);

  const registeredUser = await User.findOne(
    { _id: newUserResult._id }
  );

  expect(registeredUser.firstName).toEqual(newUserData.firstName);
});


it('測試 /api/users/ 取得所有使用者的功能', async () => {

  const testNames = ['steve', 'jessica', 'joe']

  function getUserData(name: string) {
    return {
      firstName: "Test",
      lastName: `${name}`,
      userName: `${name}`,
      email: `${name}@gmail.com`,
      password: "test1234"
    }
  }

  const registerNewUser = function (newUserData: Object) {
    return request(app).post('/api/users/register').send(newUserData)
  }

  let newUserArray = testNames.map(
    name => registerNewUser(getUserData(name))
  );

  const results = await Promise.all(newUserArray)

  // const response = await request(app).post('/api/users/register').send(newUserData);

  // expect(response.status).toEqual(201);

  // const newUserResult = JSON.parse(response.text)

  results.forEach(e => {
    console.log('results: ', JSON.parse(e.text).userName, 'is successfully registered');
  })

  // const registeredUser = await User.findOne(
  //   { _id: newUserResult._id }
  // );

  // expect(registeredUser.firstName).toEqual(newUserData.firstName);
});


// it('測試 /api/users/register 註冊使用者的功能', async () => {

//   const newUserData = {
//     firstName: "steve",
//     lastName: "leng",
//     username: "test1234545645",
//     email: "sl@gmail.com",
//     password: "1232342342351345"
//   }

//   const response = await request(app).post('/api/users/register').send(newUserData);

//   expect(response.status).toEqual(201); // 因為將沒有登入的使用者轉向至 

//   const newUserResult = JSON.parse(response.text)
//   console.log(newUserResult);

//   const registeredUser = await User.findOne(
//     { _id: newUserResult._id }
//   );

//   expect(registeredUser.firstName).toEqual(newUserData.firstName);
//   // console.log('res.locals.user: ', res.locals.user);
// });

