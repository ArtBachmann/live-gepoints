const User = require('../models/User')
const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID)


exports.findOrCreateUser = async token => {
  // verify auth token and get back users google information
  // and save it in googleUser variable..
  const googleUser = await verifyAuthToken(token)
  // check if user exists
  const user = await checkIfUserExists(googleUser.email)
  // if user exists, return them otherwise create new user
  return user ? user : createNewUser(googleUser)
}

// ==>> verify auth token async function
const verifyAuthToken = async token => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.OAUTH_CLIENT_ID
    })
    return ticket.getPayload()
  } catch (err) {
    console.log('Error verifying auth token', err)
  }
}

// ==>> check if user exists async function
const checkIfUserExists = async email => await User.findOne({ email }).exec()

// ==>> if user exists... function, not async because doesnt looking anything, just acts
const createNewUser = googleUser => {
  const { name, email, picture } = googleUser
  const user = { name, email, picture }
  return new User(user).save()
}