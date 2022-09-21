const bookModel = require("../models/bookModel");
const userModel = require('../models/userModel')
const reviewModel = require('../models/reviewModel')
const mongoose = require('mongoose')


const createBook = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0)
            return res.status(400).send({ status: false, msg: "Please fill Book Details" })

        //Extract params
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        let uniqueTitle = await bookModel.findOne({ title })
        if (uniqueTitle)
            return res.status(400).send({ status: false, msg: "This Title is already exist" })





        let userDb = await userModel.findById(userId)
        if (!userDb)
            return res.status(400).send({ status: false, msg: "This user is not exist" })


        if (!/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN))
            return res.status(400).send({ status: false, message: 'Please provide a valid ISBN' })
        //check for unique ISBN
        let ISBNcheck = await bookModel.findOne({ ISBN })
        if (ISBNcheck)
            return res.status(400).send({ status: false, msg: "This ISBN  already exists" })




        if (!/((\d{4}[-])(\d{2}[-])(\d{2}))/.test(releasedAt))
            return res.status(400).send({ status: false, message: 'Please provide a valid Date(YYYY-MM-DD)' })

        if (data.isDeleted == true) data.deletedAt = Date.now()

        let book = await bookModel.create(data)
        res.status(201).send({ status: true, message: "success", data: book })

    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, Error: err.message })
    }

}

const getBooks = async function (req, res) {
    try {
        const filter = { isDeleted: false }

        const queryParams = req.query


        {
            const { userId, category, subcategory } = queryParams

            if (userId) {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res.status(400).send({ status: false, msg: `this ${userId} user Id is not a valid Id` })
                }
                filter['userId'] = userId
                console.log(filter)
            }

            if (category) {
                filter['category'] = category
            }

            if (subcategory) {
                filter['subcategory'] = subcategory
            }
        }

        const books = await bookModel.find(filter).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).collation({ locale: "en" }).sort({ title: 1 })

        if (Object.keys(books).length == 0)
            return res.status(404).send({ status: false, msg: "No book found" })

        res.status(200).send({ status: true, msg: "success", data: books })

    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, Error: err.message })
    }
}

const getById = async function (req, res) {
    let pathParam = req.params.bookId

    if (!mongoose.Types.ObjectId.isValid(pathParam))
        return res.status(400).send({ status: false, message: "This bookId is not valid" })

    let bookData = await bookModel.findById(pathParam)  //checking book in bookmodel
    // console.log(bookData)
    if (!bookData || bookData.isDeleted)
        return res.status(404).send({ status: false, message: "No Book Found" })
    //console.log(bookData);
    const { title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt } = bookData

    const reviewsData = await reviewModel.find({ bookId: bookData._id, isDeleted: false }) 
        .select({ deletedAt: 0, isDeleted: 0, createdAt: 0, __v: 0, updatedAt: 0 })
    console.log(reviewsData)
    const BookDetails = { title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt, reviewsData }



    res.status(200).send({ status: true, message: "success", data: BookDetails })

}


const deleteBook = async function (req, res) {

    const paramId = req.params.bookId
    // console.log(paramId)

    let bookDelete = await bookModel.findOneAndUpdate({ _id: paramId }, { isDeleted: true, deletedAt: new Date() }, { new: true })

    res.status(200).send({ status: true, messsage: "success", data: bookDelete })

}

module.exports = { createBook, getBooks, getById, deleteBook }