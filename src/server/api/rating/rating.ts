import mongoose from "mongoose";
var Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const RatingSchema = new mongoose.Schema({
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

export default mongoose.model("Ratings", RatingSchema);
