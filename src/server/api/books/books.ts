import mongoose from "mongoose";
const BooksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  cover_Image: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Books", BooksSchema);
  