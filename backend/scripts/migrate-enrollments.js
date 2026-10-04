require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB } = require("../config/database");
const Course = require("../models/course");
const CourseProgress = require("../models/courseProgress");
const Enrollment = require("../models/enrollment");

const main = async () => {
  try {
    await connectDB();
    await Enrollment.init();

    const enrollments = new Map();
    const courses = await Course.collection
      .find({}, { projection: { studentsEnrolled: 1 } })
      .toArray();

    for (const course of courses) {
      for (const userId of course.studentsEnrolled || []) {
        enrollments.set(`${userId}:${course._id}`, {
          userId,
          courseId: course._id,
          enrolledAt: new Date(),
        });
      }
    }

    const progressRecords = await CourseProgress.collection
      .find({}, { projection: { userId: 1, courseId: 1, courseID: 1, createdAt: 1 } })
      .toArray();

    for (const progress of progressRecords) {
      const courseId = progress.courseId || progress.courseID;
      if (!progress.userId || !courseId) continue;

      if (!progress.courseId && progress.courseID) {
        await CourseProgress.collection.updateOne(
          { _id: progress._id },
          { $set: { courseId }, $unset: { courseID: "" } }
        );
      }

      enrollments.set(`${progress.userId}:${courseId}`, {
        userId: progress.userId,
        courseId,
        enrolledAt: progress.createdAt || new Date(),
      });
    }

    const operations = [...enrollments.values()].map((enrollment) => ({
      updateOne: {
        filter: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
        },
        update: { $setOnInsert: enrollment },
        upsert: true,
      },
    }));

    if (operations.length) {
      await Enrollment.bulkWrite(operations, { ordered: false });
    }

    console.log(`Enrollment migration completed: ${operations.length} relationships checked.`);
  } catch (error) {
    console.error("Enrollment migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

main();
