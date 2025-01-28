const request = require('supertest');
const {createApi, getApi} = require("./api/vc-issuer-api");
createApi(()=>{})
api = getApi();

describe('GET /api/health', () => {
    it('should return a status of 200 and a JSON response', async () => {
        const response = await request(api).get('/api/health');

        // Assertions
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
        expect(response.headers['content-type']).toMatch(/json/);
    });
});