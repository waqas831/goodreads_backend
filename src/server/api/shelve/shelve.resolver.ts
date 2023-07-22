import { UserInputError } from "apollo-server-express";
import Shelve from "./shelve";
import { authorization } from "../../../middleware/authorization.middleware";
import { shelveStatus } from "../../../constants/app.constants";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
const shelveResolver = {
  Query: {
    shelves: async (_: any, args: any, context: any) => {
      const auth = await authorization(context);
      return await Shelve.aggregate([
        {
          $match: { user_id: new mongoose.Types.ObjectId(auth.user) },
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
    },

    shelveByStatus: async (_: any, { status }: any, context: any) => {
      const auth = await authorization(context);
      return await Shelve.aggregate([
        {
          $match: {
            $and: [
              { user_id: new mongoose.Types.ObjectId(auth.user) },
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
    },
  },
  Mutation: {
    createShelve: async (_: any, { shelve }: any, context: any) => {
      const auth = await authorization(context);
      if (!shelveStatus.includes(shelve.status)) {
        throw new UserInputError("Invalid Status Type");
      }

      const exist = await Shelve.findOne({
        user_id: new ObjectId(auth.user),
        book_id: new ObjectId(shelve.book_id),
      });

      if (exist) {
        shelve.user_id = new ObjectId(auth.user);
        shelve.book_id = new ObjectId(shelve.book_id);

        const id = exist._id;
        const updatedBook = await Shelve.findByIdAndUpdate(id, shelve, {
          new: true,
        });
        return updatedBook;
      } else {
        shelve.user_id = new ObjectId(auth.user);
        shelve.book_id = new ObjectId(shelve.book_id);

        const result = await Shelve.create(shelve);
        return result;
      }
    },

    updateShelve: async (_: any, { id, shelve }: any, context: any) => {
      const auth = await authorization(context);
      shelve.user_id = new ObjectId(auth.user);
      if (!shelveStatus.includes(shelve.status)) {
        throw new UserInputError("Invalid Status Type");
      }
      const updatedBook = await Shelve.findByIdAndUpdate(id, shelve, {
        new: true,
      });
      if (!updatedBook) {
        throw new UserInputError("Shelve not found");
      }
      return updatedBook;
    },
    deleteShelve: async (_: any, { id }: any) => {
      const book = await Shelve.findByIdAndDelete(id);
      if (!book) {
        throw new UserInputError("Shelve not found");
      }
      return book;
    },
  },
};

export default shelveResolver;
