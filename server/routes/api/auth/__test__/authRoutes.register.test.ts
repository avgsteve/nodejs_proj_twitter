import request from 'supertest';
import { it, expect } from '@jest/globals';

const app = require('./../../../../app')
// jest.mock('../../nats-wrapper.ts');

it('測試一下測試是否能正常運作', async () => {
    let a = 1;
    expect(a).toEqual(1);
});

it('測試未登入使用者會被轉至 /login ', async () => {
    const response = await request(app).get('/');
    // console.log(`response.status: ${response.status}`);
    expect(response.status).toEqual(302); // 因為將沒有登入的使用者轉向至 
});

it('測試註冊使用者的功能', async () => {
    const response = await request(app).post('/register').send({
        "firstName": "steve",
        "lastName": "leng",
        "userName": "test1234545645",
        "email": "sl@gmail.com",
        "password": "1232342342351345"
    });

    console.log('註冊成功，Cookie: ', response.get('Set-Cookie'));


    expect(response.status).toEqual(201); // 因為將沒有登入的使用者轉向至 


    // console.log('res.locals.user: ', res.locals.user);

});

