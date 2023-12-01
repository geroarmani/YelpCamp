if (process.env.NODE_ENV !== 'production') { //We are in development mode so it will run all the time
    require('dotenv').config()
}
//require('dotenv').config()

const express = require('express')
const app = express()
const methodOverride = require('method-override')
const engine = require('ejs-mate')
const path = require('path')
const ExpressError = require('./untilities/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoose = require('mongoose')
// Injection
const mongoSanitize = require('express-mongo-sanitize')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const helmet = require('helmet') //adding different headers responces for secutiry

const MongoStore = require('connect-mongo');


const dbUrl = process.env.DB_URL
// const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl)
    .then(() => {
        console.log('Mongo Connection Ready!')
    })
    .catch(err => {
        console.log('Mongo Oh, no!')
        console.log(err)
    })

app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())

//not using the content-secutiry header because its limiting the img and scripts responces
app.use(helmet({contentSecurityPolicy: false}))

app.use(flash()) 

const store = MongoStore.create({ // defining the session store on atlas
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on('error', function(e){
    console.log('ERROR SESSION, ', e)
})

const sessionConfig = { 
    store,
    secret: 'bettersecret',
    resave: false, 
    saveUninitialized: true, 
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    } 
}

app.use(session(sessionConfig))

app.use(passport.initialize()) //passport User set up
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())) //should be after app.use(session())
passport.serializeUser(User.serializeUser()) // how to store and not store user 
passport.deserializeUser(User.deserializeUser())


app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if(!err.message) err.message  = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('campgrounds/error', { err })
})

app.listen(3000, () => {
    console.log('SERVING ON PORT 3000')
})