"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const user_1 = __importDefault(require("./user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../../../configuration/connection");
const userResolver = {
    Query: {
        user: (_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_1.default.findById(id);
            if (!user) {
                throw new apollo_server_express_1.UserInputError("User not found");
            }
            return user;
        }),
        users: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield user_1.default.find();
        }),
    },
    Mutation: {
        createUser: (_, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = yield encryptPassword(user);
            const userExisist = yield user_1.default.findOne({ email: newUser.email });
            if (userExisist) {
                throw new Error("User Already Exist");
            }
            newUser.role = "User";
            return yield user_1.default.create(newUser);
        }),
        login: (_, { user: { email, password } }) => __awaiter(void 0, void 0, void 0, function* () {
            const loginedUser = yield user_1.default.findOne({ email });
            if (!loginedUser) {
                throw new Error("User not found");
            }
            const isValidPassword = yield bcrypt_1.default.compare(password, loginedUser.password);
            if (!isValidPassword) {
                throw new Error("Invalid password");
            }
            const payload = {
                user: loginedUser._id,
                role: loginedUser.role,
                email: loginedUser.email,
            };
            const token = jsonwebtoken_1.default.sign(payload, connection_1.jwtSecret, { algorithm: 'HS256' });
            return { token, user: loginedUser, message: "Login Successfull" };
        }),
        updateUser: (_, { id, user }) => __awaiter(void 0, void 0, void 0, function* () {
            const updatedUser = yield user_1.default.findByIdAndUpdate(id, user, { new: true });
            if (!updatedUser) {
                throw new apollo_server_express_1.UserInputError("User not found");
            }
            return updatedUser;
        }),
        deleteUser: (_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_1.default.findByIdAndDelete(id);
            if (!user) {
                throw new apollo_server_express_1.UserInputError("User not found");
            }
            return user;
        }),
    },
};
/**
 * Encrypt password
 * @param user
 * @param password
 * @param res
 */
const encryptPassword = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hash = yield bcrypt_1.default.hash(user.password, salt);
        user.password = hash;
        return user;
    });
};
exports.default = userResolver;
