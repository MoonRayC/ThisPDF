const pool = require('../config/database');

class ProfileModel {
  static async create(profileData) {
    const { user_id, username, bio, avatar_url } = profileData;

    const query = `
      INSERT INTO user_profiles (user_id, username, bio, avatar_url, last_active_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [user_id, username, bio, avatar_url]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        if (error.constraint === 'user_profiles_user_id_key') {
          throw new Error('Profile already exists for this user');
        }
        if (error.constraint === 'user_profiles_username_key') {
          throw new Error('Username already taken');
        }
      }
      throw error;
    }
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1';

    try {
      const result = await pool.query(query, [user_id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findManyByUserIds(userIds) {
    if (!userIds?.length) return [];

    const placeholders = userIds.map((_, index) => `$${index + 1}`).join(', ');
    const query = `SELECT * FROM user_profiles WHERE user_id IN (${placeholders})`;

    try {
      const result = await pool.query(query, userIds);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM user_profiles WHERE username = $1';

    try {
      const result = await pool.query(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(user_id, updateData) {
    const allowedFields = ['username', 'bio', 'avatar_url'];
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(user_id);
    const query = `
      UPDATE user_profiles 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'user_profiles_username_key') {
        throw new Error('Username already taken');
      }
      throw error;
    }
  }

  static async updateLastActive(user_id) {
    const query = `
      UPDATE user_profiles 
      SET last_active_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING last_active_at;
    `;

    try {
      const result = await pool.query(query, [user_id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async delete(user_id) {
    const query = 'DELETE FROM user_profiles WHERE user_id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [user_id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async getAllProfiles(limit = 50, offset = 0) {
    const query = `
      SELECT user_id, username, bio, avatar_url, last_active_at, created_at, updated_at
      FROM user_profiles 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2;
    `;

    try {
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getProfilesCount() {
    const query = 'SELECT COUNT(*) as total FROM user_profiles';

    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].total);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProfileModel;