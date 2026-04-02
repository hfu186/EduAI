// utils/updateStreak.js
exports.updateStreak = async (user) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastActive = new Date(user.lastActiveDate).setHours(0, 0, 0, 0);
  const diffInDays = (today - lastActive) / (1000 * 60 * 60 * 24);

  if (diffInDays === 1) {
    user.studyStreak += 1;
  } else if (diffInDays > 1) {
    user.studyStreak = 1;
  } else if (user.studyStreak === 0) {
    user.studyStreak = 1;
  }
  
  user.lastActiveDate = new Date();
  await user.save();
};