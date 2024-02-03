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
    test('Gets a list of all books', async () =>{
        const response = await request(app).get('/books')
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({books: [testBook]})
    })
})

describe("GET /book/:id", () => {
    test('Gets a book by id', async () =>{
        const response = await request(app).get('/books/1234567891')
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({ book: testBook })
    })
    test('Expects error for wrong book id', async () => {
        const response = await request(app).get('/books/222222222')
        expect(response.statusCode).toBe(404)
    })
})

describe("DELETE /books/:id", () => {
    test('Deletes a book by id', async () =>{
        const response = await request(app).delete('/books/1234567891')
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({ message: "Book deleted" })

        const dbResult = await db.query('SELECT * FROM books')
        expect(dbResult.rows).toEqual([])
    })
    test('Expects error for wrong book id', async () => {
        const response = await request(app).delete('/books/222222222')
        expect(response.statusCode).toBe(404)
    })
})

describe("POST /books", () => {
    test('Add a new book to the db', async () =>{
        await db.query('DELETE FROM books')
        const response = await request(app).post('/books').send(testBook)
        expect(response.statusCode).toBe(201)
        expect(response.body).toEqual({book: testBook})
    })
    test('Expect list of errors for sending no book data', async () => {
        const response = await request(app).post('/books').send({})
        expect(response.statusCode).toBe(400)
        expect(response.body.message).toEqual(
            [
                "instance requires property \"isbn\"",
                "instance requires property \"amazon_url\"",
                "instance requires property \"author\"",
                "instance requires property \"language\"",
                "instance requires property \"pages\"",
                "instance requires property \"publisher\"",
                "instance requires property \"title\"",
                "instance requires property \"year\""
            ]
        )
    })
})

describe("PUT /books/:id", () => {
    test('Update a book', async () =>{
        const response = await request(app).put('/books/1234567891').send({
            isbn: "1234567891",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        })
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({book: {
            isbn: '1234567891',
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        }})
    })
    test('Expect list of errors for sending no book data', async () => {
        const response = await request(app).put('/books/1234567891').send({})
        expect(response.statusCode).toBe(400)
        expect(response.body.message).toEqual(
            [
                "instance requires property \"isbn\"",
                "instance requires property \"amazon_url\"",
                "instance requires property \"author\"",
                "instance requires property \"language\"",
                "instance requires property \"pages\"",
                "instance requires property \"publisher\"",
                "instance requires property \"title\"",
                "instance requires property \"year\""
            ]
        )
    })
})

