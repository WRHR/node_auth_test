const router = require('express').Router()
const User = require('../models/User')
const { required } = require('@hapi/joi')
const {registerValidation, loginValidation } = require('../validation')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


router.post('/register', async (req, res) => {
    //Validate request
    const {error} = registerValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    //Check if user exists
    const emailExists = await User.findOne({ email: req.body.email })
    if(emailExists) return res.status(400).send('Email already exists')

    //Hash Password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    //Create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    })
    try{
        const savedUser = await user.save()
        res.send({user: user.id})
    } catch(err){
        res.status(400).send(err)
    }
})

//LOGIN
router.post('/login', async (req, res) => {
    //Validate request
    const {error} = loginValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    //Check if user exists
    const user = await User.findOne({ email: req.body.email })
    if(!user) return res.status(400).send('Email is incorrect')

    //Check password
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword) return res.status(400).send('Password is incorrect')

    //Create token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
    res.header('auth-token', token).send(token)
})


module.exports = router