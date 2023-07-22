import mongoose from "mongoose";
import { roles } from "../../../constants/app.constants";
var Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const UserSchema = new mongoose.Schema({
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
  role: { type: String, default: roles.USER },
});

export default mongoose.model("User", UserSchema);
