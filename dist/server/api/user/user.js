"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_constants_1 = require("../../../constants/app.constants");
var Schema = mongoose_1.default.Schema;
const ObjectId = Schema.Types.ObjectId;
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: { type: String, default: app_constants_1.roles.USER },
});
exports.default = mongoose_1.default.model("User", UserSchema);
