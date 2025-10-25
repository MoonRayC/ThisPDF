const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Document Metadata API',
      version: '1.0.0',
      description: 'API for managing document metadata with file uploads, search, and user management',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3004/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        Metadata: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the metadata record'
            },
            file_id: {
              type: 'string',
              description: 'Unique identifier for the associated file'
            },
            file_url: {
              type: 'string',
              format: 'uri',
              description: 'URL to the file',
              nullable: true
            },
            image_url: {
              type: 'string',
              format: 'uri',
              description: 'URL to the thumbnail/preview image'
            },
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Title of the document'
            },
            description: {
              type: 'string',
              description: 'Description of the document',
              nullable: true
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of tags associated with the document'
            },
            category: {
              type: 'string',
              maxLength: 100,
              description: 'Primary category of the document',
              nullable: true
            },
            subcategory: {
              type: 'string',
              maxLength: 100,
              description: 'Subcategory of the document',
              nullable: true
            },
            pages: {
              type: 'integer',
              minimum: 1,
              description: 'Number of pages in the document',
              nullable: true
            },
            size_kb: {
              type: 'integer',
              minimum: 1,
              description: 'File size in kilobytes',
              nullable: true
            },
            visibility: {
              type: 'string',
              enum: ['public', 'private', 'friends'],
              description: 'Visibility setting for the document'
            },
            uploader_id: {
              type: 'integer',
              description: 'ID of the user who uploaded the document'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the metadata was created'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the metadata was last updated'
            }
          },
          required: ['file_id', 'image_url', 'title', 'uploader_id']
        },
        CreateMetadataRequest: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'Unique identifier for the file'
            },
            file_url: {
              type: 'string',
              format: 'uri',
              description: 'URL to the file'
            },
            image_url: {
              type: 'string',
              format: 'uri',
              description: 'URL to the thumbnail/preview image'
            },
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Title of the document'
            },
            description: {
              type: 'string',
              description: 'Description of the document'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of tags'
            },
            category: {
              type: 'string',
              maxLength: 100,
              description: 'Primary category'
            },
            subcategory: {
              type: 'string',
              maxLength: 100,
              description: 'Subcategory'
            },
            pages: {
              type: 'integer',
              minimum: 1,
              description: 'Number of pages'
            },
            size_kb: {
              type: 'integer',
              minimum: 1,
              description: 'File size in KB'
            },
            visibility: {
              type: 'string',
              enum: ['public', 'private', 'friends'],
              default: 'private',
              description: 'Visibility setting'
            }
          },
          required: ['file_id', 'image_url', 'title']
        },
        UpdateMetadataRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Updated title'
            },
            description: {
              type: 'string',
              description: 'Updated description'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Updated tags'
            },
            category: {
              type: 'string',
              maxLength: 100,
              description: 'Updated category'
            },
            subcategory: {
              type: 'string',
              maxLength: 100,
              description: 'Updated subcategory'
            },
            visibility: {
              type: 'string',
              enum: ['public', 'private', 'friends'],
              description: 'Updated visibility'
            }
          },
          minProperties: 1
        },
        BulkDeleteRequest: {
          type: 'object',
          properties: {
            file_ids: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 1,
              description: 'Array of file IDs to delete'
            }
          },
          required: ['file_ids']
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Metadata'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Current page number'
                },
                limit: {
                  type: 'integer',
                  description: 'Items per page'
                },
                total: {
                  type: 'integer',
                  description: 'Total number of items'
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total number of pages'
                }
              }
            }
          }
        },
        UserStats: {
          type: 'object',
          properties: {
            uploader_id: {
              type: 'integer',
              description: 'User ID'
            },
            total_documents: {
              type: 'integer',
              description: 'Total number of documents uploaded'
            },
            public_documents: {
              type: 'integer',
              description: 'Number of public documents'
            },
            private_documents: {
              type: 'integer',
              description: 'Number of private documents'
            },
            friends_documents: {
              type: 'integer',
              description: 'Number of friends-only documents'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              description: 'Response data'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      },
      parameters: {
        FileIdParam: {
          name: 'file_id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Unique file identifier'
        },
        UploaderIdParam: {
          name: 'uploader_id',
          in: 'path',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'User ID of the uploader'
        },
        VisibilityParam: {
          name: 'visibility',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            enum: ['public', 'private', 'friends']
          },
          description: 'Document visibility level'
        },
        PageQuery: {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number for pagination'
        },
        LimitQuery: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Number of items per page'
        },
        SortQuery: {
          name: 'sort',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['created_at', 'title', 'pages'],
            default: 'created_at'
          },
          description: 'Field to sort by'
        },
        OrderQuery: {
          name: 'order',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc'
          },
          description: 'Sort order'
        }
      }
    },
    security: []
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;