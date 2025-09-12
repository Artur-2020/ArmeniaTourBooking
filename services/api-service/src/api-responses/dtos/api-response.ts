// API Response definitions - no external imports needed

export const verifyAccount = {
  success: {
    status: 200,
    description: 'Account verified successfully',
    // type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        status: 200,
        message: 'User signed in successfully',
        data: {
          refreshToken: 'xxx',
          accessToken: 'xxx',
        },
      },
    },
  },
  error: {
    status: 400,
    description: 'Validation error',
    // type: ErrorResponseDto,
    schema: {
      example: {
        error: true,
        status: 400,
        message: 'Validation failed',
        details: [
          {
            field: 'token',
            errors: ['The Token is invalid', 'The Token should not be empty'],
          },
        ],
      },
    },
  },
};

export const signUp = {
  success: {
    status: 200,
    description: 'Sign Up Successful',
    // type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        status: 200,
        message: 'User registered successfully',
        data: {
          refreshToken: 'xxx',
          accessToken: 'xxx',
          user: {},
        },
      },
    },
  },
  error: {
    status: 400,
    description: 'Validation error',
    // type: ErrorResponseDto,
    schema: {
      example: {
        error: true,
        status: 400,
        message: 'Validation failed',
        details: [
          {
            field: 'password',
            errors: [
              'Password must include at least one letter, one number, and one special character',
              'The password field must contain at least 8 symbols and a maximum of 20',
              'The Password should not be empty',
            ],
          },
          {
            field: 'confirm_password',
            errors: ['The password does not match'],
          },
        ],
      },
    },
  },
};

export const signIn = {
  success: {
    status: 200,
    description: 'Sign In Successful',
    // type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        status: 200,
        message: 'User signed in successfully',
        data: {
          refreshToken: 'xxx',
          accessToken: 'xxx',
        },
      },
    },
  },
  error: {
    status: 400,
    description: 'Validation error',
    // type: ErrorResponseDto,
    schema: {
      example: {
        error: true,
        status: 400,
        message: 'Invalid credentials',
        details: [
          {
            field: 'email',
            errors: ['The email is not valid'],
          },
          {
            field: 'password',
            errors: [
              'The password is incorrect',
              'The password should not be empty',
            ],
          },
        ],
      },
    },
  },
};

export const createPassword = {
  success: {
    status: 200,
    description: 'Password Created Successfully',
    // type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        status: 200,
        message: 'Password created successfully',
        data: null,
      },
    },
  },
  error: {
    status: 400,
    description: 'Validation error',
    // type: ErrorResponseDto,
    schema: {
      example: {
        error: true,
        status: 400,
        message: 'Validation failed',
        details: [
          {
            field: 'password',
            errors: [
              'Password must include at least one letter, one number, and one special character',
              'The password field must contain at least 8 symbols and a maximum of 20',
              'The Password should not be empty',
            ],
          },
          {
            field: 'confirm_password',
            errors: ['The password does not match'],
          },
        ],
      },
    },
  },
};

export const verifyOtp = {
  success: {
    status: 200,
    description: 'OTP Verified Successfully',
    // type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        status: 200,
        message: 'OTP verified successfully',
        data: { verified: true },
      },
    },
  },
  error: {
    status: 400,
    description: 'Validation error',
    // type: ErrorResponseDto,
    schema: {
      example: {
        error: true,
        status: 400,
        message: 'Invalid OTP',
        details: [
          {
            field: 'code',
            errors: ['The OTP is invalid', 'The OTP should not be empty'],
          },
        ],
      },
    },
  },
};

export const commonResponses = {
  unauthorized: {
    description: 'Unauthorized access',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized access' },
      },
    },
  },
  success: {
    status: 200,
    description: 'Request was successfully processed.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Success',
        data: null,
      },
    },
  },
  error: {
    status: 400,
    description: 'Request contains invalid data or an error occurred.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        errors: [
          {
            field: 'email',
            message: 'Email must be a valid email address.',
          },
        ],
      },
    },
  },
};

export const twoFactorResponses = {
  generateQr: {
    success: {
      status: 200,
      description: 'QR code was successfully generated.',
      schema: {
        example: {
          success: true,
          statusCode: 200,
          message: 'QR code generated successfully',
          data: {
            qrCode: 'base64encodedQRCodeString',
          },
        },
      },
    },
    error: {
      status: 500,
      description: 'An error occurred while generating the QR code.',
      schema: {
        example: {
          statusCode: 500,
          message: 'Failed to generate QR code',
        },
      },
    },
  },
};

export const refreshToken = {
  success: {
    status: 200,
    description: 'Token refreshed successfully',
    // type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        status: 200,
        message: 'Token refreshed successfully',
        data: {
          refreshToken: 'new_refresh_token_here',
          accessToken: 'new_access_token_here',
        },
      },
    },
  },
  error: {
    status: 400,
    description: 'Invalid refresh token',
    // type: ErrorResponseDto,
    schema: {
      example: {
        error: true,
        status: 400,
        message: 'Invalid refresh token',
        details: [
          {
            field: 'refreshToken',
            errors: ['The refresh token is invalid or expired'],
          },
        ],
      },
    },
  },
};

export const logout = {
  success: {
    status: 200,
    description: 'Logout successful',
    // type: SuccessResponseDto,
    schema: {
      example: {
        success: true,
        status: 200,
        message: 'Logout successful',
        data: null,
      },
    },
  },
  error: {
    status: 400,
    description: 'Invalid refresh token',
    // type: ErrorResponseDto,
    schema: {
      example: {
        error: true,
        status: 400,
        message: 'Invalid refresh token',
        details: [
          {
            field: 'refreshToken',
            errors: ['The refresh token is invalid'],
          },
        ],
      },
    },
  },
};
