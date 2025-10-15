/**
 * Application API Documentation
 */

// Application Schema
const applicationSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Application unique identifier'
    },
    jobId: {
      type: 'string',
      format: 'uuid',
      description: 'ID of the job applied for'
    },
    resumeId: {
      type: 'string',
      format: 'uuid',
      description: 'ID of the resume used for application',
      nullable: true
    },
    userId: {
      type: 'string',
      format: 'uuid',
      description: 'ID of the user who applied'
    },
    coverLetter: {
      type: 'string',
      description: 'Cover letter for the application',
      nullable: true
    },
    status: {
      type: 'string',
      enum: ['PENDING', 'REVIEWED', 'INTERVIEW', 'REJECTED', 'HIRED'],
      description: 'Current status of the application'
    },
    appliedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Date and time when the application was submitted'
    }
  }
};

// Apply to job request schema
const applyToJobRequestSchema = {
  type: 'object',
  properties: {
    resumeId: {
      type: 'string',
      format: 'uuid',
      description: 'ID of the resume to use for application',
      nullable: true
    },
    coverLetter: {
      type: 'string',
      description: 'Cover letter for the application',
      nullable: true
    }
  }
};

// Application routes documentation
module.exports = {
  paths: {
    '/jobs/{id}/apply': {
      post: {
        tags: ['Applications'],
        summary: 'Apply to a job',
        description: 'Allow a candidate to apply to a job posting',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'Job ID'
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApplyToJobRequest'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Application submitted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    application: {
                      $ref: '#/components/schemas/Application'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          403: {
            description: 'Forbidden - user does not have CANDIDATE role or has already applied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Job not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/jobs/{id}/applications': {
      get: {
        tags: ['Applications'],
        summary: 'Get all applications for a job',
        description: 'Allow an employer to view all applications for their job posting',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'Job ID'
          }
        ],
        responses: {
          200: {
            description: 'List of applications',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    applications: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Application'
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          403: {
            description: 'Forbidden - user is not the job poster or an admin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Job not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/applications/{id}': {
      get: {
        tags: ['Applications'],
        summary: 'Get application details',
        description: 'Get details of a specific application (for job poster or applicant)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'Application ID'
          }
        ],
        responses: {
          200: {
            description: 'Application details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    application: {
                      $ref: '#/components/schemas/Application'
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          403: {
            description: 'Forbidden - user is not the job poster or applicant',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Application not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/jobs/{id}/export': {
      get: {
        tags: ['Applications'],
        summary: 'Export job applications as CSV',
        description: 'Export all applications for a specific job as a CSV file',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'Job ID'
          }
        ],
        responses: {
          200: {
            description: 'CSV file download',
            content: {
              'text/csv': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          403: {
            description: 'Forbidden - user is not the job poster or an admin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Job not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Application: applicationSchema,
      ApplyToJobRequest: applyToJobRequestSchema
    }
  }
};