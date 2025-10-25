const { query } = require('../config/database');

class MetadataModel {
  async create(metadataData) {
    const {
      file_id,
      file_url,
      image_url,
      title,
      description,
      tags,
      category,
      subcategory,
      pages,
      size_kb,
      visibility,
      uploader_id
    } = metadataData;

    const result = await query(`
      INSERT INTO metadata (
        file_id, file_url, image_url, title, description, 
        tags, category, subcategory, pages, size_kb, 
        visibility, uploader_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      file_id, file_url, image_url, title, description,
      tags, category, subcategory, pages, size_kb,
      visibility, uploader_id
    ]);

    return result.rows[0];
  }

  async findByFileId(fileId) {
    const result = await query(
      'SELECT * FROM metadata WHERE file_id = $1',
      [fileId]
    );
    return result.rows[0];
  }

  async findByFileIds(fileIds = []) {
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      throw new Error('fileIds must be a non-empty array');
    }
    const result = await query(
      `SELECT * FROM metadata WHERE file_id = ANY($1)`,
      [fileIds]
    );
    return result.rows;
  }

  async findByUploaderId(uploaderId, { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = {}) {
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT * FROM metadata 
      WHERE uploader_id = $1 
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT $2 OFFSET $3
    `, [uploaderId, limit, offset]);

    const countResult = await query(
      'SELECT COUNT(*) FROM metadata WHERE uploader_id = $1',
      [uploaderId]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  async findByUploaderIdAndVisibility(uploaderId, visibility, { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = {}) {
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT * FROM metadata 
      WHERE uploader_id = $1 AND visibility = $2
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT $3 OFFSET $4
    `, [uploaderId, visibility, limit, offset]);

    const countResult = await query(
      'SELECT COUNT(*) FROM metadata WHERE uploader_id = $1 AND visibility = $2',
      [uploaderId, visibility]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  async findPublic({ page = 1, limit = 10, sort = 'created_at', order = 'desc' } = {}) {
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT * FROM metadata 
      WHERE visibility = 'public'
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await query(
      "SELECT COUNT(*) FROM metadata WHERE visibility = 'public'"
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  async findPrivate({ page = 1, limit = 10, sort = 'created_at', order = 'desc' } = {}) {
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT * FROM metadata 
      WHERE visibility = 'private'
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await query(
      "SELECT COUNT(*) FROM metadata WHERE visibility = 'private'"
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  async getUserStats(uploaderId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_uploads,
        COUNT(CASE WHEN visibility = 'public' THEN 1 END) as public_uploads,
        COUNT(CASE WHEN visibility = 'private' THEN 1 END) as private_uploads
      FROM metadata 
      WHERE uploader_id = $1
    `, [uploaderId]);

    return result.rows[0];
  }

  async update(fileId, updates, uploaderId) {
    const allowedFields = ['title', 'description', 'tags', 'category', 'subcategory', 'visibility'];
    const updateFields = [];
    const params = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        params.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(fileId, uploaderId);
    const result = await query(`
      UPDATE metadata 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE file_id = $${paramCount + 1} AND uploader_id = $${paramCount + 2}
      RETURNING *
    `, params);

    return result.rows[0];
  }

  async delete(fileId, uploaderId) {
    const result = await query(
      'DELETE FROM metadata WHERE file_id = $1 AND uploader_id = $2 RETURNING *',
      [fileId, uploaderId]
    );
    return result.rows[0];
  }

  async bulkDelete(fileIds, uploaderId) {
    const result = await query(
      'DELETE FROM metadata WHERE file_id = ANY($1) AND uploader_id = $2 RETURNING file_id',
      [fileIds, uploaderId]
    );
    return result.rows.map(row => row.file_id);
  }

  async findMyDocuments(uploaderId, { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = {}) {
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT * FROM metadata 
      WHERE uploader_id = $1 
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT $2 OFFSET $3
    `, [uploaderId, limit, offset]);

    const countResult = await query(
      'SELECT COUNT(*) FROM metadata WHERE uploader_id = $1',
      [uploaderId]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }
}

module.exports = new MetadataModel();