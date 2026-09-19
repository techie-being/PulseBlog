import { User } from "../models/user.models.js";
import { Like } from "../models/likes.models.js";
import { Post } from "../models/post.models.js";

const userSyncVector = async (userId) => {
  console.log("🔥 userSyncVector CALLED");

  const user = await User.findById(userId);

  if (!user) {
    console.log("❌ User not found");
    return;
  }

  const likes = await Like.find({ likedBy: userId }).select("postId");

  console.log("🔥 Total liked posts:", likes.length);

  const baseVector = user.baseInterestVector;

  // Check whether the user has a real onboarding vector
  const hasBaseVector =
    Array.isArray(baseVector) &&
    baseVector.length === 384 &&
    baseVector.some((value) => value !== 0);

  /*
   * No likes
   * → onboarded user: restore onboarding vector
   * → skipped user: keep zero vector
   */
  if (likes.length === 0) {
    if (hasBaseVector) {
      user.userIntrestVector = [...baseVector];
      console.log("✅ Restored base interest vector");
    } else {
      user.userIntrestVector = new Array(384).fill(0);
      console.log("✅ No likes / no onboarding → zero vector");
    }

    user.behavioralSignalCount = 0;

    await user.save();
    return;
  }

  const postIds = likes.map((like) => like.postId);

  const posts = await Post.find({
    _id: { $in: postIds },
  }).select("contentVector");

  const validPosts = posts.filter(
    (post) =>
      Array.isArray(post.contentVector) &&
      post.contentVector.length === 384
  );

  console.log("🔥 Valid post vectors:", validPosts.length);

  if (validPosts.length === 0) {
    console.log("❌ No valid post vectors found");
    return;
  }

  /*
   * Start with:
   *
   * onboarded user → base interest vector
   * skipped user   → zero vector
   */
  const newVector = hasBaseVector
    ? [...baseVector]
    : new Array(384).fill(0);

  // Add behavioral influence from currently liked posts
  for (const post of validPosts) {
    post.contentVector.forEach((value, index) => {
      newVector[index] += 0.1 * value;
    });
  }

  // Normalize according to number of liked posts
  for (let i = 0; i < newVector.length; i++) {
    newVector[i] /= 1 + validPosts.length * 0.1;
  }

  user.userIntrestVector = newVector;

  // Current number of valid behavioral signals
  user.behavioralSignalCount = validPosts.length;

  await user.save();

  console.log(
    "✅ VECTOR REBUILT",
    user.userIntrestVector.length,
    user.userIntrestVector.slice(0, 5)
  );

  console.log(
    "🔥 behavioralSignalCount:",
    user.behavioralSignalCount
  );
};

export { userSyncVector };