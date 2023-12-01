const mongoose = require('mongoose')
const Campground = require('../models/campground')
const Review = require('../models/reviews')
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('Mongo Connection Ready!')
    })
    .catch(err => {
        console.log('Mongo Oh, no!')
        console.log(err)
    })

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async() => {
    await Campground.deleteMany({})
    await Review.deleteMany({})
    for(let i = 0; i < 100; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dfkaodmtf/image/upload/v1700922255/YelpCamp/azeprrgvzuorhkqtw4uj.jpg',
                    filename: 'YelpCamp/azeprrgvzuorhkqtw4uj',
                  },
                  {
                    url: 'https://res.cloudinary.com/dfkaodmtf/image/upload/v1700922112/YelpCamp/gy6sunkvqmsmlj15lkfb.jpg',
                    filename: 'YelpCamp/gy6sunkvqmsmlj15lkfb',
                  }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. In, minima officia! Error hic quos facere quae cupiditate! Praesentium, rem enim iure necessitatibus at non autem doloribus nulla saepe animi magni?',
            price,
            author: '655cc9901356678089970c38',
            geometry:  { 
                type: 'Point', 
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            }
        })
        await camp.save()
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close()
        console.log('Done.')
    })

// const deleteReviews = async() => {
//     const review = await Review.findByIdAndDelete('654e86881958cf9260cf596a')
//     console.log(review)
// }

