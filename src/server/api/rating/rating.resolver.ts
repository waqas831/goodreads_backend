import { UserInputError } from "apollo-server-express";
import Rating from "./rating";
import { authorization } from "../../../middleware/authorization.middleware";
import { io } from "../../../app";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import Book from "../books/books";

const ratingResolver = {
  Mutation: {
    createRating: async (_: any, { rating }: any, context: any) => {
      const auth = await authorization(context);
      const exist = await Rating.findOne({
        user_id: new ObjectId(auth.user),
        book_id: new ObjectId(rating.book_id),
      });

      if (exist) {
        rating.user_id = new ObjectId(auth.user);
        rating.book_id = new ObjectId(rating.book_id);
        const id = exist._id;
        const updatedBook = await Rating.findByIdAndUpdate(id, rating, {
          new: true,
        });
        broadCast(rating.book_id);
        return updatedBook;
      } else {
        rating.user_id = new ObjectId(auth.user);
        rating.book_id = new ObjectId(rating.book_id);
        const result = await Rating.create(rating);
        broadCast(rating.book_id);
        return result;
      }
    },

    updateRating: async (_: any, { id, rating }: any, context: any) => {
      const auth = await authorization(context);
      rating.user_id = new ObjectId(auth.user);
      rating.book_id = new ObjectId(rating.book_id);

      const updatedRating = await Rating.findByIdAndUpdate(id, rating, {
        new: true,
      });
      if (!updatedRating) {
        throw new UserInputError("Rating not found");
      }
      return updatedRating;
    },
  },
};

const broadCast = async (id: any) => {
  const book = await Book.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
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
  io.emit("book-rating", { book_id: id, book: book[0] });
};

export default ratingResolver;
