const { default: mongoose } = require("mongoose")
const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")


const isValid = function(value){
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true
}


const reviewBoook = async function(req,res)
{
    let paramId = req.params.bookId

    if(!mongoose.Types.ObjectId.isValid(paramId))
    return res.status(400).send({status:false, msg:"Please enter valid path Id"})

    let findBook = await bookModel.findById(paramId).select({__v:0})
    console.log(findBook)

    if(!findBook || findBook.isDeleted)
    return res.status(404).send({status:false, msg:"Book does not exist"})
   
    // res.status(200).send({status:true, data:findBook})
    const requestBody = req.body

    if(Object.keys(requestBody).length==0)
    return res.status(400).send({status:false, msg:"Please fill Details"})

    const {bookId, reviewedBy, reviewedAt, rating, review, isDeleted} = requestBody

    if(!isValid(bookId))
    return res.status(400).send({status:false, msg:"Please enter book Id"})
    // check for valid Id
    if(!mongoose.Types.ObjectId.isValid(bookId))
    return res.status(400).send({status:false, msg:"Please enter valid book Id"})
    // check with path id
    if(bookId !== paramId)
    return res.status(400).send({status:false, msg:"Plese enter book Id same as Path Id"})

    if(!isValid(reviewedBy))
    return res.status(400).send({status:false, msg:"Plese enter reviewer name"})

    if(!isValid(reviewedAt))
    return res.status(400).send({status:false, msg:"Plese enter review time"})

    if(!isValid(rating))
    return res.status(400).send({status:false, msg:"Plese enter Rating"})
  
    if(!(/^[12345]$/.test(rating))(rating))
    return res.status(400).send({status:false, msg:"Plese enter rating from 1 to 5 in int form only"})    

    let reviewCreated = await reviewModel.create(requestBody)
   
    // await bookModel.findOneAndUpdate({_id:findBook},{$inc:{reviews:1}},{new:true})
    findBook.reviews = findBook.reviews + 1
    await findBook.save()

    let printReview = await reviewModel.findOne({_id:reviewCreated}).select({__v: 0,createdAt: 0,updatedAt: 0,isDeleted: 0})

    findBook = findBook.toObject()

    findBook.reviewsData = printReview


    res.status(200).send({status:true, message:"success", data:findBook})

}

const bookReviewBook = async function(req,res)
{
    const bookParamId = req.params.bookId

    if(!mongoose.Types.ObjectId.isValid(bookParamId))
    return res.status(400).send({status:false, msg:`this ${bookParamId} book Param Id is not valid`})

    let findBook = await bookModel.findById(bookParamId)

    if(!findBook || findBook.isDeleted)
    return res.status(404).send({status:false, message:"Book does not exist"})

    // res.status(200).send({status:false, message:"success", data:findBook})

    const reviewId = req.params.reviewId

    if(!mongoose.Types.ObjectId.isValid(reviewId))
    return res.status(400).send({status:false, msg:`This ${reviewId} Review Id is not a valid Id`})
 
    var findReview = await reviewModel.findOne({_id:reviewId, bookId:bookParamId, isDeleted:false})
    
    if(!findReview)
    return res.status(400).send({status:false, msg:"No review is found"})

    // res.status(200).send({status:false, message:"success" , data:findReview})

    const reviewedBody =  req.body

    if(Object.keys(reviewedBody).length==0)
    return res.status(400).send({status:false, message:"Please fill details for update review"})

    const {review, rating, reviewedBy} = reviewedBody

    if(review){
        if(!isValid(review)){
            return res.status(400).send({status:false, message:"Please enter Valid Review"})
        }
    }

    if(rating){
        if(!isValid(rating)){
            return res.status(400).send({status:false, message:"Please enter valid rating"})

        }
        if(!(/^[12345]$/.test(rating))(rating)){
            return res.status(400).send({status:false, message:"Please enter rating from 1 to 5"})
        }
    }

    if(reviewedBy){
        if(!isValid(reviewedBy)){
            return res.status(400).send({status:false, message:"Please enter valid Reviewer's name"})
        }
    }
   
    const updatedData = {review, rating, reviewedBy}

    const updateReviewDetails = await reviewModel.findOneAndUpdate({_id:findReview},updatedData,{new:true})

    res.status(200).send({status:false, message:"Success", data:updateReviewDetails})

}



module.exports = {reviewBoook, bookReviewBook}