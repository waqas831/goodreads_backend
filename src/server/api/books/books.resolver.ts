import { UserInputError } from "apollo-server-express";
import Book from "./books";
import fs from "fs";
import mongoose from "mongoose";
import { authorization } from "../../../middleware/authorization.middleware";
import { roles } from "../../../constants/app.constants";
var path = require("path");
const bookResolver = {
  Query: {
    books: async () => {
      return Book.aggregate([
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
    },
  },
  Mutation: {
    book: async (_: any, { id }: any) => {
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
      if (!book || book.length === 0) {
        throw new UserInputError("Book not found");
      }
      return book[0];
    },

    createBook: async (_: any, { book }: any, context: any) => {
      const auth = await authorization(context);
      if (auth?.role != roles.ADMIN) {
        throw new Error("You are not allowded to perform this action");
      }
      const base64Image = await book.cover_Image;
      if (!base64Image) {
        throw new UserInputError("Cover Image Required");
      }
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      const fileName = `${Date.now()}.png`;
      const directory = path.join(__dirname, "../../../../public/images");
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      fs.writeFileSync(path.join(directory, fileName), imageBuffer);
      book.cover_Image = `${fileName}`;
      return await Book.create(book);
    },

    updateBook: async (_: any, { id, book }: any, context: any) => {
      const auth = await authorization(context);
      if (auth?.role != roles.ADMIN) {
        throw new Error("You are not allowded to perform this action");
      }

      if(!book.cover_Image?.includes(".png")){

        const base64Image = await book.cover_Image;
        if (!base64Image) {
          throw new UserInputError("Cover Image Required");
        }
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");
        const fileName = `${Date.now()}.png`;
        const directory = path.join(__dirname, "../../../../public/images");
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }
        fs.writeFileSync(path.join(directory, fileName), imageBuffer);
        book.cover_Image = `${fileName}`;
  

      }
      
      const updatedBook = await Book.findByIdAndUpdate(id, book, { new: true });
      if (!updatedBook) {
        throw new UserInputError("Book not found");
      }
      return updatedBook;
    },
    deleteBook: async (_: any, { id }: any, context: any) => {
      const auth = await authorization(context);
      if (auth?.role != roles.ADMIN) {
        throw new Error("You are not allowded to perform this action");
      }
      const book = await Book.findByIdAndDelete(id);
      if (!book) {
        throw new UserInputError("Book not found");
      }
      return book;
    },
  },
};

export default bookResolver;
