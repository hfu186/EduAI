const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    courseDescription: {
      type: String,
      required: true,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    whatYouWillLearn: {
      type: String,
    },

    courseContent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
      },
    ],

    ratingAndReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview",
      },
    ],

    price: {
      type: Number,
      default: 0,
    },

    thumbnail: {
      type: String,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    tag: {
      type: [String],
      default: [],
    },
    level: {
  type: String,
  enum: ["Beginner", "Intermediate", "Advanced"],
  default: "Beginner",
},

    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    instructions: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["Draft", "Published", "Pending"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);
