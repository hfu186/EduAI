const Profile = require('../../models/profile');
const User = require('../../models/user');
const CourseProgress = require('../../models/courseProgress')
const Course = require('../../models/course')
const { uploadImageToCloudinary, getFileBase64 } = require('../../utils/imageUploader');

const fs = require('fs');
const { convertSecondsToDuration } = require('../../utils/secToDuration')
const { createNotification } = require('../../utils/notification')




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
      experience = ''
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

    // save data to DB
    await profileDetails.save();

    const updatedUserDetails = await User.findById(userId)
      .populate({
        path: 'additionalDetails'
      })
    // console.log('updatedUserDetails -> ', updatedUserDetails);

    // return response
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
    const userEnrolledCoursesId = userDetails.courses
    console.log('userEnrolledCourses ids = ', userEnrolledCoursesId)

    for (const courseId of userEnrolledCoursesId) {
      await Course.findByIdAndUpdate(courseId, {
        $pull: { studentsEnrolled: userId }
      })
    }

    // first - delete profie (profileDetails)
    await Profile.findByIdAndDelete(userDetails.additionalDetails);

    // second - delete account
    await User.findByIdAndDelete(userId);


    // sheduale this deleting account , crone job

    // return response
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


// ================ request to become instructor ================
exports.requestInstructor = async (req, res) => {
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
        link: '/admin',
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
    // extract userId
    const userId = req.user.id;
    console.log('id - ', userId);

    // get user details
    const userDetails = await User.findById(userId).populate('additionalDetails').exec();

    // return response
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
    let userDetails = await User.findById(userId)
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();

    userDetails = userDetails.toObject();

    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalNoOfLectures = 0;
      userDetails.courses[i].courseContent.forEach((sec) => {
        totalNoOfLectures += sec.subSection.length;
      });

      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      });

      let completedCount = courseProgressCount?.completedSubSections?.length || 0;

      if (totalNoOfLectures === 0) {
        userDetails.courses[i].progressPercentage = 100;
      } else {
        const multiplier = Math.pow(10, 2);
        userDetails.courses[i].progressPercentage =
          Math.round((completedCount / totalNoOfLectures) * 100 * multiplier) / multiplier;
      }
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
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

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
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
    const allInstructors = await User.find({ accountType: "Instructor" })
      .populate("additionalDetails")
      .populate("courses")
      .sort({ firstName: 1 })
      .select("-password -token -resetPasswordToken -resetPasswordExpires");
    return res.status(200).json({
      success: true,
      data: allInstructors,
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

    const instructCourses = await Course.find({
      instructor: instructorId,
      status: "Published",
    }).populate("ratingAndReviews");

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    let totalStudents = 0;
    let totalReviews = 0;
    let totalRating = 0;

    instructCourses.forEach((course) => {
      totalStudents += course.studentsEnrolled.length;
      totalReviews += course.ratingAndReviews.length;

      course.ratingAndReviews.forEach((r) => {
        totalRating += r.rating;
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        ...instructorDetails.toObject(),
        courses: instructCourses,
        stats: {
          totalStudents,
          totalReviews,
          averageRating:
            totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0,
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
