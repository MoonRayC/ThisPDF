const ProfileModel = require('../models/profile.model');

class ProfileController {
  static async createProfile(req, res, next) {
    try {
      const user_id = req.user.id;

      const { username, bio, avatar_url } = req.body;

      const profileData = {
        user_id,
        username,
        bio: bio || null,
        avatar_url: avatar_url || null
      };

      const profile = await ProfileModel.create(profileData);

      res.status(201).json({
        message: 'Profile created successfully',
        data: {
          id: profile.id,
          user_id: profile.user_id,
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          last_active_at: profile.last_active_at,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // TP-0011: Get User Profile
  static async getProfile(req, res, next) {
    try {
      const { user_id } = req.params;
      
      const profile = await ProfileModel.findByUserId(user_id);
      
      if (!profile) {
        return res.status(404).json({
          error: 'User profile not found'
        });
      }

      res.status(200).json({
        data: {
          id: profile.id,
          user_id: profile.user_id,
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          last_active_at: profile.last_active_at,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfileByUsername(req, res, next) {
    try {
      const { username } = req.params;
      
      const profile = await ProfileModel.findByUsername(username);
      
      if (!profile) {
        return res.status(404).json({
          error: 'User profile not found'
        });
      }

      res.status(200).json({
        data: {
          id: profile.id,
          user_id: profile.user_id,
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          last_active_at: profile.last_active_at,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { user_id } = req.params;
      const updateData = req.body;

      const updatedProfile = await ProfileModel.update(user_id, updateData);

      if (!updatedProfile) {
        return res.status(404).json({
          error: 'User profile not found'
        });
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        data: {
          id: updatedProfile.id,
          user_id: updatedProfile.user_id,
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          avatar_url: updatedProfile.avatar_url,
          last_active_at: updatedProfile.last_active_at,
          created_at: updatedProfile.created_at,
          updated_at: updatedProfile.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateLastActive(req, res, next) {
    try {
      const { user_id } = req.params;

      const result = await ProfileModel.updateLastActive(user_id);

      if (!result) {
        return res.status(404).json({
          error: 'User profile not found'
        });
      }

      res.status(200).json({
        message: 'Last active timestamp updated successfully',
        data: {
          last_active_at: result.last_active_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfile(req, res, next) {
    try {
      const { user_id } = req.params;

      const deletedProfile = await ProfileModel.delete(user_id);

      if (!deletedProfile) {
        return res.status(404).json({
          error: 'User profile not found'
        });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getAllProfiles(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const profiles = await ProfileModel.getAllProfiles(limit, offset);
      const total = await ProfileModel.getProfilesCount();

      res.status(200).json({
        data: profiles,
        pagination: {
          current_page: page,
          per_page: limit,
          total_records: total,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;