const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken}) //know what token and where to connect

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewFrom = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.postCampground = async (req, res) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // res.send(geoData.body.features[0].geometry.coordinates) //features is array with objects, accessing first object
    // Geocode creater ^
    
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry // saving the whole geojson object for easier access
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename})) //going through each image and making url and filename fields
    campground.author = req.user._id
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully made a new campground.')
    res.redirect(`campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id).populate({ //populating the reviews field in the campgrounds collection and also populating author in reviews collection
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if(!camp){
        req.flash('error', 'This campground does not exist.')
        res.redirect('/campgrounds')
    } else {
        res.render('campgrounds/show', { camp })
    }
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    if(!camp){
        req.flash('error', 'This campground does not exist.')
        return res.redirect('/campgrounds')
    } 
    res.render('campgrounds/edit', { camp })
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const imgs = req.files.map(f => ({ url : f.path, filename: f.filename}))
    campground.images.push(...imgs) //using the spread operator so we dont push array into the array, but objects into the array
    await campground.save()
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename) //deleting the images from the cloudinary
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}})
    }
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted!')
    res.redirect('/campgrounds')
}