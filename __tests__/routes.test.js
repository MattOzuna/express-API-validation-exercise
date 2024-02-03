process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require('../models/book')

let testBook;

beforeEach(async () =>{
    testBook = await Book.create(
        {
        isbn: "1234567891",
        amazon_url: "http://test.test",
        author: "Test Test",
        language: "english",
        pages: 222,
        publisher: "Testing Publisher",
        title: "Learn How to Test",
        year: 2023
    })
})

afterEach( async() => {
    await db.query('DELETE FROM books');
})

afterAll( async()=>{
    await db.end();
})

describe("GET /books", () => {
    test('gets a list of all books', async () =>{
        const response = await request(app).get('/books')
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({books: [testBook]})
    })
})
