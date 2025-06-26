require('dotenv').config();
const database = require('../src/config/database');
const {
  FriendRequest,
  Friendship,
  BlockedUser,
  FriendshipActivity
} = require('./models/friend.model');
const {
  FriendRecommendation
} = require('./models/recommendation.model');

const uuid1 = '11111111-1111-1111-1111-111111111111';
const uuid2 = '22222222-2222-2222-2222-222222222222';

const seed = async () => {
  await database.connect();

  try {
    // Clear old data
    await Promise.all([
      FriendRequest.deleteMany(),
      Friendship.deleteMany(),
      BlockedUser.deleteMany(),
      FriendshipActivity.deleteMany(),
      FriendRecommendation.deleteMany()
    ]);

    // Insert sample data
    await FriendRequest.create({
      requester_id: uuid1,
      recipient_id: uuid2,
      message: 'Let’s connect!',
    });

    await Friendship.create({
      user1_id: uuid1,
      user2_id: uuid2,
      action_user_id: uuid1
    });

    await BlockedUser.create({
      blocker_id: uuid2,
      blocked_id: uuid1,
      reason: 'Spam'
    });

    await FriendshipActivity.create({
      user_id: uuid1,
      friend_id: uuid2,
      activity_type: 'FRIEND_REQUEST_SENT',
      metadata: { platform: 'web' }
    });

    await FriendRecommendation.create({
      user_id: uuid1,
      recommended_user_id: uuid2,
      score: 0.85,
      reason: 'You have 5 mutual friends'
    });

    console.log('✅ Sample data inserted!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await database.disconnect();
  }
};

seed();
