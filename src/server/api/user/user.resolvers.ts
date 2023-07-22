import { UserInputError } from "apollo-server-express";
import User from "./user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../../../configuration/connection";

const userResolver = {
  Query: {
    user: async (_: any, { id }: any) => {
      const user = await User.findById(id);
      if (!user) {
        throw new UserInputError("User not found");
      }
      return user;
    },
    users: async () => {
      return await User.find();
    },
  },
  Mutation: {
    createUser: async (_: any, { user }: any) => {
      const newUser = await encryptPassword(user);
      const userExisist = await User.findOne({ email: newUser.email });
      if (userExisist) {
        throw new Error("User Already Exist");
      }
      newUser.role = "User";
      return await User.create(newUser);
    },

    login: async (_: any, { user: { email, password } }: any) => {
      const loginedUser = await User.findOne({ email });

      if (!loginedUser) {
        throw new Error("User not found");
      }

      const isValidPassword = await bcrypt.compare(
        password,
        loginedUser.password
      );

      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      const payload = {
        user: loginedUser._id,
        role: loginedUser.role,
        email: loginedUser.email,
      };

      const token = jwt.sign(payload, jwtSecret, { algorithm: 'HS256' });
      return { token, user: loginedUser, message: "Login Successfull" };
    },

    updateUser: async (_: any, { id, user }: any) => {
      const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
      if (!updatedUser) {
        throw new UserInputError("User not found");
      }
      return updatedUser;
    },
    deleteUser: async (_: any, { id }: any) => {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new UserInputError("User not found");
      }
      return user;
    },
  },
};

/**
 * Encrypt password
 * @param user
 * @param password
 * @param res
 */
const encryptPassword = async function (user: any) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  return user;
};

export default userResolver;
