const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')

router.get('/test-me', async function (req, res) {
    res.send("hey")
})

router.post('/register', userController.createUser)
router.post('/login', userController.login)

router.post('/books', bookController.createBook)
router.get('/books', bookController.getBooks)
router.get("/books/:bookId", bookController.getById) 
//update books by bookid remaining
router.delete("/books/:bookId", bookController.deleteBook) 



router.post("/books/:bookId/review", reviewController.reviewBoook)
router.put("/books/:bookId/review/:reviewId", reviewController.bookReviewBook)
//delete review by reviewId
module.exports = router;

