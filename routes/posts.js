const router = require('express').Router()
const verify = require('./privateRoutes')
const User = require('../models/User')

router.get('/', verify, async (req, res)=> {
    const authUser = await User.find({_id: req.user._id})
    res.send(authUser)
})

module.exports = router