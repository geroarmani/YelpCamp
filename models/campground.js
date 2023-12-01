const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./reviews')

// https://res.cloudinary.com/dfkaodmtf/image/upload/w_200/v1700922255/YelpCamp/azeprrgvzuorhkqtw4uj.jpg 

// when passing virtual models to JSON they are not passed, with this tho they are
const opts = { toJSON: { virtuals: true } }

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')     //vitrual method
})

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

campgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}" style="text-decoration: none;">${this.title}</a></strong>`
})

campgroundSchema.post('findOneAndDelete', async(camp) => {
    if(camp){
        await Review.deleteMany({
            _id: {
                $in: camp.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema)