const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
   
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id}).select('-__v -password');
                return userData
            }
            throw new AuthenticationError("You are not logged in.");
        },
    },

    Mutation: {
        // login 
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError("Credentials could not be validated.");
            }

            const correctPW = await user.isCorrectPassword(password);
            if (!correctPW) {
                throw new AuthenticationError("Credentials could not be validated.");
            }
            const token = signToken(user);

            return { token, user };
        },

        // addUser
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        // saveBook
        saveBook: async (parent, { input }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addtoSet: { savedBooks: input } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("You must log in!");
        },

        // removeBook
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("You must log in!");
        },
    },
};

module.exports = resolvers;