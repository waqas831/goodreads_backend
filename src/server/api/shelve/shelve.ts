import mongoose from "mongoose";
var Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ShelveSchema = new mongoose.Schema({
  user_id: {
    type: ObjectId,
    required: true,
  },
  book_id: {
    type: ObjectId,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Shelves", ShelveSchema);
