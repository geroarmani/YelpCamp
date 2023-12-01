const Campground = require('../models/campground')
const Review = require('../models/reviews')

module.exports.createReview = async(req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)  
    review.author = req.user._id  
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    console.log(review)
    req.flash('success', 'Successfully created new rewiew.')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async(req, res) => {
    const { id, reviewID } = req.params
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewID }} )
    await Review.findByIdAndDelete(reviewID)
    req.flash('success', 'Successfully deleted review.')
    res.redirect(`/campgrounds/${id}`)
}