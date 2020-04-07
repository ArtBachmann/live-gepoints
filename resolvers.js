const { AuthenticationError } = require('apollo-server')
const Pin = require('./models/Pin')


// special higher order resolver function
const authenticated = next => (root, args, ctx, info) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError('You must be logged in!')
  }
  // if current user exists >>>
  // next makes possible to execute the resolver function.
  return next(root, args, ctx, info)
}

module.exports = {
  Query: {
    // resolver function !!
    // from me: returns the context data about the current user...
    me: authenticated((root, args, ctx) => ctx.currentUser),
    getPins: async (root, args, ctx) => {
      const pins = await Pin.find({}).populate('author').populate('comments.author')
      return pins
    }
  },

  Mutation: {
    createPin: authenticated(async (root, args, ctx) => {
      const newPin = await new Pin({
        ...args.input,
        author: ctx.currentUser._id
      }).save()
      const pinAdded = await Pin.populate(newPin, 'author')
      return pinAdded
    }),
    deletePin: authenticated(async (root, args, ctx) => {
      const pinDeleted = await Pin.findOneAndDelete({ _id: args.pinId })
        .exec()
      return pinDeleted
    }),
    createComment: authenticated(async (root, args, ctx) => {
      const newComment = { text: args.text, author: ctx.currentUser._id }
      const pinUpdated = await Pin.findOneAndUpdate(
        // find a pin by id >>
        { _id: args.pinId },
        // add new comment to comments array
        { $push: { comments: newComment } },
        // return updated document >> 
        { new: true }
      )
        .populate('author')
        .populate('comments.author')
      return pinUpdated
    })
  }
}