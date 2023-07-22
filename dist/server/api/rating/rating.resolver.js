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
const rating_1 = __importDefault(require("./rating"));
const authorization_middleware_1 = require("../../../middleware/authorization.middleware");
const app_1 = require("../../../app");
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const books_1 = __importDefault(require("../books/books"));
const ratingResolver = {
    Mutation: {
        createRating: (_, { rating }, context) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = yield (0, authorization_middleware_1.authorization)(context);
            const exist = yield rating_1.default.findOne({
                user_id: new mongodb_1.ObjectId(auth.user),
                book_id: new mongodb_1.ObjectId(rating.book_id),
            });
            if (exist) {
                rating.user_id = new mongodb_1.ObjectId(auth.user);
                rating.book_id = new mongodb_1.ObjectId(rating.book_id);
                const id = exist._id;
                const updatedBook = yield rating_1.default.findByIdAndUpdate(id, rating, {
                    new: true,
                });
                broadCast(rating.book_id);
                return updatedBook;
            }
            else {
                rating.user_id = new mongodb_1.ObjectId(auth.user);
                rating.book_id = new mongodb_1.ObjectId(rating.book_id);
                const result = yield rating_1.default.create(rating);
                broadCast(rating.book_id);
                return result;
            }
        }),
        updateRating: (_, { id, rating }, context) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = yield (0, authorization_middleware_1.authorization)(context);
            rating.user_id = new mongodb_1.ObjectId(auth.user);
            rating.book_id = new mongodb_1.ObjectId(rating.book_id);
            const updatedRating = yield rating_1.default.findByIdAndUpdate(id, rating, {
                new: true,
            });
            if (!updatedRating) {
                throw new apollo_server_express_1.UserInputError("Rating not found");
            }
            return updatedRating;
        }),
    },
};
const broadCast = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield books_1.default.aggregate([
        {
            $match: { _id: new mongoose_1.default.Types.ObjectId(id) },
        },
        {
            $lookup: {
                from: "ratings",
                localField: "_id",
                foreignField: "book_id",
                as: "ratings",
            },
        },
        {
            $addFields: {
                ratings: { $ifNull: ["$ratings", []] },
            },
        },
        {
            $addFields: {
                average_rating: { $avg: "$ratings.stars" },
            },
        },
        {
            $project: {
                title: 1,
                author: 1,
                cover_Image: 1,
                date: 1,
                average_rating: 1,
                ratings: 1,
            },
        },
    ]);
    app_1.io.emit("book-rating", { book_id: id, book: book[0] });
});
exports.default = ratingResolver;
