const axios = require('axios');
const config = require('../config');

class FriendService {
  static async getFriendsList(userId) {
    try {
      const response = await axios.get(`${config.services.friend}/api/friends/list/${userId}`, {
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          // User has no friends or user not found
          return { friends: [], pagination: { total: 0 } };
        }
        throw new Error(`Friend service error: ${error.response.status}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Friend service timeout');
      } else {
        throw new Error('Friend service unavailable');
      }
    }
  }

  static async isUserFriend(uploaderId, currentUserId) {
    try {
      const friendsData = await this.getFriendsList(uploaderId);
      return friendsData.friends.includes(currentUserId);
    } catch (error) {
      // If we can't check friends, assume not a friend for security
      console.error('Error checking friend status:', error.message);
      return false;
    }
  }
}

module.exports = FriendService;