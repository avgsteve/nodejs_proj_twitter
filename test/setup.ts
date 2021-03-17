import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { jest, beforeAll, beforeEach, afterAll } from '@jest/globals';
require('dotenv').config();

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[]; // 傳出作為session cookie的內容
    }
  }
}

// // 讓 NATS Client 可以被引入測試的流程中
// jest.mock('../nats-wrapper.ts');
jest.setTimeout(30000);

let mongo: any;
beforeAll(async () => {
  process.env.JWT_SECRET = 'asdfasdf';
  process.env.SERVER_PORT_DEV = '3009';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  // console.log('mongoUri: ', mongoUri);

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});

// 測試開始之前的設置環境
beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {

  // console.log('signing in with fake token');
  // 透過自訂 Cookie 建立一個假的使用者身分
  // Build a JWT payload.  { id, email }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };


  // Create the JWT! (process.env.JWT_KEY 在 beforeAll中事先建立)
  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  const signedToken = { jwt: token };


  const tokenJSON = JSON.stringify(signedToken);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(tokenJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  // return [`express:sess=${base64}`];
  return [`jwtCookie=${base64}`];

};