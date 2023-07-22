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
const books_1 = __importDefault(require("./books"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const authorization_middleware_1 = require("../../../middleware/authorization.middleware");
const app_constants_1 = require("../../../constants/app.constants");
var path = require("path");
const bookResolver = {
    Query: {
        books: () => __awaiter(void 0, void 0, void 0, function* () {
            return books_1.default.aggregate([
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
                { $sort: { date: -1 } },
            ]);
        }),
    },
    Mutation: {
        book: (_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
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
            if (!book || book.length === 0) {
                throw new apollo_server_express_1.UserInputError("Book not found");
            }
            return book[0];
        }),
        createBook: (_, { book }, context) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = yield (0, authorization_middleware_1.authorization)(context);
            if ((auth === null || auth === void 0 ? void 0 : auth.role) != app_constants_1.roles.ADMIN) {
                throw new Error("You are not allowded to perform this action");
            }
            const base64Image = yield book.cover_Image;
            if (!base64Image) {
                throw new apollo_server_express_1.UserInputError("Cover Image Required");
            }
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, "base64");
            const fileName = `${Date.now()}.png`;
            const directory = path.join(__dirname, "../../../../public/images");
            if (!fs_1.default.existsSync(directory)) {
                fs_1.default.mkdirSync(directory, { recursive: true });
            }
            fs_1.default.writeFileSync(path.join(directory, fileName), imageBuffer);
            book.cover_Image = `${fileName}`;
            return yield books_1.default.create(book);
        }),
        updateBook: (_, { id, book }, context) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = yield (0, authorization_middleware_1.authorization)(context);
            if ((auth === null || auth === void 0 ? void 0 : auth.role) != app_constants_1.roles.ADMIN) {
                throw new Error("You are not allowded to perform this action");
            }
            const base64Image = yield book.cover_Image;
            if (!base64Image) {
                throw new apollo_server_express_1.UserInputError("Cover Image Required");
            }
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, "base64");
            const fileName = `${Date.now()}.png`;
            const directory = path.join(__dirname, "../../../../public/images");
            if (!fs_1.default.existsSync(directory)) {
                fs_1.default.mkdirSync(directory, { recursive: true });
            }
            fs_1.default.writeFileSync(path.join(directory, fileName), imageBuffer);
            book.cover_Image = `${fileName}`;
            const updatedBook = yield books_1.default.findByIdAndUpdate(id, book, { new: true });
            if (!updatedBook) {
                throw new apollo_server_express_1.UserInputError("Book not found");
            }
            return updatedBook;
        }),
        deleteBook: (_, { id }, context) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = yield (0, authorization_middleware_1.authorization)(context);
            if ((auth === null || auth === void 0 ? void 0 : auth.role) != app_constants_1.roles.ADMIN) {
                throw new Error("You are not allowded to perform this action");
            }
            const book = yield books_1.default.findByIdAndDelete(id);
            if (!book) {
                throw new apollo_server_express_1.UserInputError("Book not found");
            }
            return book;
        }),
    },
};
exports.default = bookResolver;
