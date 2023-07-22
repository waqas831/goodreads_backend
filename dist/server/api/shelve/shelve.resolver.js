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
const shelve_1 = __importDefault(require("./shelve"));
const authorization_middleware_1 = require("../../../middleware/authorization.middleware");
const app_constants_1 = require("../../../constants/app.constants");
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const shelveResolver = {
    Query: {
        shelves: (_, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = yield (0, authorization_middleware_1.authorization)(context);
            return yield shelve_1.default.aggregate([
                {
                    $match: { user_id: new mongoose_1.default.Types.ObjectId(auth.user) },
                },
                {
                    $lookup: {
                        from: "books",
                        localField: "book_id",
                        foreignField: "_id",
                        as: "book",
                    },
                },
                {
                    $unwind: {
                        path: "$book",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "ratings",
                        localField: "book._id",
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
                        _id: 1,
                        user_id: 1,
                        book_id: 1,
                        status: 1,
                        created_at: 1,
                        average_rating: 1,
                        ratings: 1,
                        book: 1,
                    },
                },
                { $sort: { created_at: -1 } },
            ]);
        }),
        shelveByStatus: (_, { status }, context) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = yield (0, authorization_middleware_1.authorization)(context);
            return yield shelve_1.default.aggregate([
                {
                    $match: {
                        $and: [
                            { user_id: new mongoose_1.default.Types.ObjectId(auth.user) },
                            { status },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: "books",
                        localField: "book_id",
                        foreignField: "_id",
                        as: "book",
                    },
                },
                {
                    $unwind: {
                        path: "$book",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "ratings",
                        localField: "book._id",
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
                        _id: 1,
                        user_id: 1,
                        book_id: 1,
                        status: 1,
                        created_at: 1,
                        average_rating: 1,
                        ratings: 1,
                        book: 1,
                    },
                },
                { $sort: { created_at: -1 } },
            ]);
        }),
    },
    Mutation: {
        createShelve: (_, { shelve }, context) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = yield (0, authorization_middleware_1.authorization)(context);
            if (!app_constants_1.shelveStatus.includes(shelve.status)) {
                throw new apollo_server_express_1.UserInputError("Invalid Status Type");
            }
            const exist = yield shelve_1.default.findOne({
                user_id: new mongodb_1.ObjectId(auth.user),
                book_id: new mongodb_1.ObjectId(shelve.book_id),
            });
            if (exist) {
                shelve.user_id = new mongodb_1.ObjectId(auth.user);
                shelve.book_id = new mongodb_1.ObjectId(shelve.book_id);
                const id = exist._id;
                const updatedBook = yield shelve_1.default.findByIdAndUpdate(id, shelve, {
                    new: true,
                });
                return updatedBook;
            }
            else {
                shelve.user_id = new mongodb_1.ObjectId(auth.user);
                shelve.book_id = new mongodb_1.ObjectId(shelve.book_id);
                const result = yield shelve_1.default.create(shelve);
                return result;
            }
        }),
        updateShelve: (_, { id, shelve }, context) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = yield (0, authorization_middleware_1.authorization)(context);
            shelve.user_id = new mongodb_1.ObjectId(auth.user);
            if (!app_constants_1.shelveStatus.includes(shelve.status)) {
                throw new apollo_server_express_1.UserInputError("Invalid Status Type");
            }
            const updatedBook = yield shelve_1.default.findByIdAndUpdate(id, shelve, {
                new: true,
            });
            if (!updatedBook) {
                throw new apollo_server_express_1.UserInputError("Shelve not found");
            }
            return updatedBook;
        }),
        deleteShelve: (_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            const book = yield shelve_1.default.findByIdAndDelete(id);
            if (!book) {
                throw new apollo_server_express_1.UserInputError("Shelve not found");
            }
            return book;
        }),
    },
};
exports.default = shelveResolver;
