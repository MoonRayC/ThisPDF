const MetadataService = require('../services/metadata.service');
const UploadService = require('../services/upload.service');
const FriendService = require('../services/friend.service');
const { HTTP_STATUS, ERROR_MESSAGES, FILE_VISIBILITY } = require('../utils/constants.util');

class ViewerController {
  static async getFileViewer(req, res, next) {
    try {
      const { file_id } = req.params;
      const currentUser = req.user;

      // Step 1: Get actual metadata object
      const metadata = await MetadataService.getFileMetadata(file_id);

      // Step 2: Check access permissions
      const hasAccess = await ViewerController.checkFileAccess(metadata, currentUser);

      if (!hasAccess) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: ERROR_MESSAGES.ACCESS_DENIED
        });
      }

      // Step 3: Get file URL (from metadata or upload service)
      let fileUrl = metadata.file_url;

      if (!fileUrl) {
        const uploadData = await UploadService.getFileUrl(file_id, metadata.visibility, req.headers.authorization);
        fileUrl = uploadData.file_url;
      }

      // Step 4: Prepare and send response
      const response = {
        file_url: fileUrl,
        image_url: metadata.image_url,
        metadata: {
          title: metadata.title,
          tags: metadata.tags || [],
          category: metadata.category,
          subcategory: metadata.subcategory,
          size_kb: metadata.size_kb,
          pages: metadata.pages,
          visibility: metadata.visibility,
          uploader_id: metadata.uploader_id
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async checkFileAccess(metadata, currentUser) {
    // Public files are accessible to everyone
    if (metadata.visibility === FILE_VISIBILITY.PUBLIC) {
      return true;
    }

    // Private files require authentication
    if (!currentUser) {
      return false;
    }

    // Uploader can always access their own files
    if (metadata.uploader_id === currentUser.id) {
      return true;
    }

    // Check if current user is in uploader's friend list
    const isFriend = await FriendService.isUserFriend(metadata.uploader_id, currentUser.id);
    return isFriend;
  }
}

module.exports = ViewerController;
