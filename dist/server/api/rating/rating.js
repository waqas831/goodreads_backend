"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
const ObjectId = Schema.Types.ObjectId;
const RatingSchema = new mongoose_1.default.Schema({
    user_id: {
        type: ObjectId,
        required: true,
    },
    book_id: {
        type: ObjectId,
        required: true,
    },
    stars: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});
exports.default = mongoose_1.default.model("Ratings", RatingSchema);
