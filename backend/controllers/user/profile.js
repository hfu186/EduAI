const Profile = require('../../models/profile');
const User = require('../../models/user');
const CourseProgress = require('../../models/courseProgress')
const Enrollment = require('../../models/enrollment')
const Course = require('../../models/course')
const enrollmentService = require('../../services/enrollment.service')
const { uploadImageToCloudinary, getFileBase64 } = require('../../utils/imageUploader');
const fs = require('fs');
const { convertSecondsToDuration } = require('../../utils/secToDuration')
const { createNotification } = require('../../utils/notification')
const RatingAndReview = require('../../models/ratingAndReview')

exports.updateProfile = async (req, res) => {
  try {
    const {
      gender = '',
      dateOfBirth = "",
      about = "",
      contactNumber = '',
      firstName,
      lastName,
      qualifications = '',
      experience = '',
      existingCertificates = '[]',
    } = req.body;

    const userId = req.user.id;

    const userDetails = await User.findById(userId);
    const profileId = userDetails.additionalDetails;
    let profileDetails = await Profile.findById(profileId);

    if (!profileDetails) {
      profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
        qualifications: null,
        experience: null,
        certificates: [],
      });

      userDetails.additionalDetails = profileDetails._id;
      await userDetails.save();
    }

    userDetails.firstName = firstName;
    userDetails.lastName = lastName;
    await userDetails.save();

    profileDetails.gender = gender;
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    profileDetails.qualifications = qualifications;
    profileDetails.experience = experience;
    let parsedExistingCertificates = [];
    try {
      parsedExistingCertificates = JSON.parse(existingCertificates);
    } catch (e) {
      parsedExistingCertificates = [];
    }

    let newCertificateUrls = [];

    if (req.files && req.files.certificateImages) {
      const rawFiles = Array.isArray(req.files.certificateImages)
        ? req.files.certificateImages
        : [req.files.certificateImages];

      const ALLOWED_TYPES = ['jpg', 'jpeg', 'png'];
      const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

      for (const file of rawFiles) {
        const ext = file.name.split('.').pop().toLowerCase();

        if (!ALLOWED_TYPES.includes(ext)) {
          return res.status(400).json({
            success: false,
            message: `File "${file.name}" has an unsupported format`,
          });
        }

        if (file.size > MAX_SIZE_BYTES) {
          return res.status(400).json({
            success: false,
            message: `File "${file.name}" exceeds the 10MB limit`,
          });
        }
      }

      for (const file of rawFiles) {
        const uploaded = await uploadImageToCloudinary(
          file,
          process.env.FOLDER_NAME_CERTIFICATES || 'instructor-certificates'
        );
        newCertificateUrls.push(uploaded.secure_url);
      }
    }

    profileDetails.certificates = [...parsedExistingCertificates, ...newCertificateUrls];


    await profileDetails.save();

    const updatedUserDetails = await User.findById(userId)
      .populate({
        path: 'additionalDetails'
      })

    res.status(200).json({
      success: true,
      updatedUserDetails,
      message: 'Profile updated successfully'
    });
  }
  catch (error) {
    console.log('Error while updating profile');
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while updating profile'
    })
  }
}


// ================ delete Account ================
exports.deleteAccount = async (req, res) => {
  try {
    // extract user id
    const userId = req.user.id;

    // validation
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    await Promise.all([
      Enrollment.deleteMany({ userId }),
      CourseProgress.deleteMany({ userId }),
    ])

    await Profile.findByIdAndDelete(userDetails.additionalDetails);

    await User.findByIdAndDelete(userId);
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    })
  }
  catch (error) {
    console.log('Error while updating profile');
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while deleting profile'
    })
  }
}


exports.  requestInstructor = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.accountType === 'Instructor') {
      return res.status(400).json({ success: false, message: 'You are already an instructor' });
    }

    if (user.instructorRequestStatus === 'pending') {
      return res.status(400).json({ success: false, message: 'Your request is pending admin approval' });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      bio,
      qualifications,
      experience,
    } = req.body || {};

    
    let uploadedDocs = [];

    if (req.files && req.files.documents) {
      const rawFiles = Array.isArray(req.files.documents)
        ? req.files.documents
        : [req.files.documents];

      if (rawFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please attach at least one verification document',
        });
      }

      const ALLOWED_TYPES = ['pdf', 'jpg', 'jpeg', 'png'];
      const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

      for (const file of rawFiles) {
        const ext = file.name.split('.').pop().toLowerCase();

        if (!ALLOWED_TYPES.includes(ext)) {
          return res.status(400).json({
            success: false,
            message: `File "${file.name}" has an unsupported format`,
          });
        }

        if (file.size > MAX_SIZE_BYTES) {
          return res.status(400).json({
            success: false,
            message: `File "${file.name}" exceeds the 10MB limit`,
          });
        }
      }

      for (const file of rawFiles) {
        const uploaded = await uploadImageToCloudinary(
          file,
          process.env.FOLDER_NAME_INSTRUCTOR_DOCS || 'instructor-requests',
          undefined,
          undefined,
          { resource_type: 'auto' }
        );

        uploadedDocs.push({
          name: file.name,
          url: uploaded.secure_url,
          uploadedAt: new Date(),
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please attach at least one verification document',
      });
    }

    user.instructorRequestStatus = 'pending';
    user.instructorRequestDetails = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      phone: phone || '',
      bio: bio || '',
      qualifications: qualifications || '',
      experience: experience || '',
      documents: uploadedDocs,
    };
    await user.save();

    const admins = await User.find({ accountType: 'Admin' }).select('_id');
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        type: 'course_approved',
        title: 'New instructor request',
        message: `${user.firstName} ${user.lastName} wants to become an instructor.`,
        link: '/admin/manage-instructors',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Instructor request submitted successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInstructorRequestStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('instructorRequestStatus accountType');
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('id - ', userId);
   const userDetails = await User.findById(userId).populate('additionalDetails').exec();
    res.status(200).json({
      success: true,
      data: userDetails,
      message: 'User data fetched successfully'
    })
  }
  catch (error) {
    console.log('Error while fetching user details');
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while fetching user details'
    })
  }
}



exports.updateUserProfileImage = async (req, res) => {
  try {
    if (!req.files || !req.files.profileImage) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const profileImage = req.files.profileImage;
    const userId = req.user.id;
    const base64Image = getFileBase64(profileImage);
    const updatedUserDetails = await User.findByIdAndUpdate(
      userId,
      { image: base64Image },
      { new: true }
    ).populate("additionalDetails");
    if (profileImage.tempFilePath) {
      fs.unlink(profileImage.tempFilePath, (err) => {
        if (err) console.error("Temp file delete error:", err);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: updatedUserDetails,
    });

  } catch (error) {
    console.error("Update profile image error:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating profile image",
      error: error.message,
    });
  }
};
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const [enrollments, progresses] = await Promise.all([
      Enrollment.find({ userId })
        .sort({ enrolledAt: 1 })
        .populate({
          path: "courseId",
          populate: {
            path: "courseContent",
            populate: { path: "subSection" },
          },
        })
        .lean(),
      CourseProgress.find({ userId }).lean(),
    ]);
    const progressByCourse = new Map(
      progresses.map((progress) => [String(progress.courseId), progress])
    );

    const courses = enrollments
      .filter((enrollment) => enrollment.courseId)
      .map((enrollment) => {
        const course = enrollment.courseId;
        const progress = progressByCourse.get(String(course._id)) || {};

        const lectureIds = new Set();
        (course.courseContent || []).forEach((sec) => {
          (sec.subSection || []).forEach((sub) => lectureIds.add(String(sub._id)));
        });

        const completedCount = new Set(
          (progress.completedSubSections || [])
            .map(String)
            .filter((id) => lectureIds.has(id))
        ).size;

        const total = lectureIds.size;
        const progressPercentage =
          total === 0 ? 100 : Math.round((completedCount / total) * 10000) / 100;

        return { ...course, progressPercentage };
      });

    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const certificates = await Certificate.find({ user: userId })
      .populate({
        path: "course",
        select: "courseName thumbnail",
      })
      .sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not fetch certificates" });
  }
};
// ================ instructor Dashboard ================
exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const enrollmentCounts = await enrollmentService.getEnrollmentCounts(
      courseDetails.map((course) => course._id)
    )
    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = enrollmentCounts.get(String(course._id)) || 0
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json(
      {
        courses: courseData,
        message: 'Instructor Dashboard Data fetched successfully'
      },

    )
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

exports.getAllInstructors = async (req, res) => {
  try {
    const allInstructors = await User.find({
      accountType: "Instructor"
    })
      .populate("additionalDetails")
      .sort({ firstName: 1 })
      .select("-password -token -resetPasswordToken -resetPasswordExpires")
      .lean();

    const instructorIds = allInstructors.map(
      (instructor) => instructor._id
    );

    const courses = await Course.find({
      instructor: { $in: instructorIds }
    })
      .select("courseName instructor price status thumbnail ratingAvg ratingCount" )
      .lean()

    const instructorWithCourses = allInstructors.map((instructor) => {
      const instructorCourses = courses.filter(
        (course) =>
          course.instructor.toString() === instructor._id.toString()
      );

      return {
        ...instructor,
        courses: instructorCourses,
        totalCourses: instructorCourses.length,
      };
    });

    return res.status(200).json({
      success: true,
      data: instructorWithCourses,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getInstructorPublicProfile = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const instructorDetails = await User.findById(instructorId)
      .populate("additionalDetails")
      .select("-password -token -resetPasswordToken -resetPasswordExpires")
      .exec();

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // Get instructor courses
    const instructCourses = await Course.find({
      instructor: instructorId,
    });

    // Attach enrolled students
    const enrolledCourses =
      await enrollmentService.attachEnrollmentStudents(instructCourses);

    // Get course IDs
    const courseIds = enrolledCourses.map(course => course._id);

    // Fetch all reviews belonging to these courses
    const reviews = await RatingAndReview.find({
      course: { $in: courseIds },
    });

    // Group reviews by course ID
    const reviewsMap = new Map();

    reviews.forEach(review => {
      const courseId = review.course.toString();

      if (!reviewsMap.has(courseId)) {
        reviewsMap.set(courseId, []);
      }

      reviewsMap.get(courseId).push(review);
    });

    let totalStudents = 0;
    let totalReviews = 0;
    let totalRating = 0;

    // Attach ratingAndReviews to each course
    const coursesWithRating = enrolledCourses.map(course => {
      const courseReviews =
        reviewsMap.get(course._id.toString()) || [];

      const courseTotalRating = courseReviews.reduce(
        (sum, review) => sum + (Number(review.rating) || 0),
        0
      );

      totalStudents += course.studentsEnrolled?.length || 0;
      totalReviews += courseReviews.length;
      totalRating += courseTotalRating;

      return {
        ...(course.toObject ? course.toObject() : course),
        ratingAndReviews: courseReviews,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        ...instructorDetails.toObject(),
        courses: coursesWithRating,
        stats: {
          totalStudents,
          totalReviews,
          averageRating:
            totalReviews > 0
              ? Number((totalRating / totalReviews).toFixed(1))
              : 0,
          totalCourses: instructCourses.length,
        },
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
