const Users = require("../models/userModel")
const bcrypt = require("bcrypt")

module.exports.register = async (req,res,next) =>{
  try {
    const {username,email,password} = req.body

    const usernameCheck = await Users.findOne({username})
    if(usernameCheck) {
      return res.json({msg: "Username already used", status: false})
    }

    const emailCheck = await Users.findOne({email})
    if(emailCheck) {
      return res.json({msg: "Email already used", status: false})
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await Users.create({
      email,
      username,
      password: hashedPassword
    })

    delete user.password
    return res.json({status: true, user})
  } catch (error) {
    next(error)
  }
}

module.exports.login = async (req,res,next) =>{
  try {
    const {username,password} = req.body

    const user = await Users.findOne({username})
    if(!user) {
      return res.json({msg: "Incorrect username or password", status: false})
    }

    const isPasswordValid = await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
      return res.json({msg: "Incorrect username or password", status: false})
    }
    delete user.password

    return res.json({status: true, user})
  } catch (error) {
    next(error)
  }
}

module.exports.setAvatar = async (req,res,next) =>{
  try {
    const userId = req.params.id
    const avatarImage = req.body.image
    const userData = await Users.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage,
    },{new: true})

    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage
    })
  } catch (error) {
    next(error)
  }
}

module.exports.getAllUsers = async (req,res,next) =>{
  try {
    const users = await Users.find({_id:{$ne:req.params.id}}).select([
      "email",
      "username",
      "avatarImage",
      "_id"
    ])
    return res.json(users)  
  } catch (error) {
    next(error)
  }
}