export const createUserSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "User created successfully.",
      },
      400: {
        description: "Input Fields Required.",
      },
      409: {
        description: "User already exists.",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const loginUserSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully logged in.",
      },
      400: {
        description: "Input Fields Required.",
      },
      404: {
        description: "User not found.",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const otpSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully logged in with OTP.",
      },
      400: {
        description: "OTP Verification Failed.",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const resendEmailVerifySwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully re-send email verification",
      },
      400: {
        description: "Sending email verification failed",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const resendOTPVerifySwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully re-send otp code",
      },
      400: {
        description: "Sending otp code failed",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const resetPasswordSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully send reset link",
      },
      400: {
        description: "Sending failed",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const verifyEmailSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Email Verified Successfully.",
      },
      400: {
        description: "Email Verification Failed.",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const currentUserSwagger = {
  "hapi-swagger": {
    securityDefinitions: {
      jwt: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
    security: [{ jwt: [] }],
    responses: {
      200: {
        description: "Get current user successfully.",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const getAllUserSwawgger = {
  "hapi-swagger": {
    security: [{ jwt: [] }],
    responses: {
      200: {
        description: "Get all user successfully.",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Permission error",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const getSingleUserSwagger = {
  "hapi-swagger": {
    security: [{ jwt: [] }],
    responses: {
      200: {
        description: "Get signle user successfully.",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Permission error",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const updateSingleUserSwagger = {
  "hapi-swagger": {
    security: [{ jwt: [] }],
    responses: {
      200: {
        description: "Update single user successfully.",
      },
      400: {
        description: "Cannot update",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};

export const deleteSingleUserSwagger = {
  "hapi-swagger": {
    security: [{ jwt: [] }],
    responses: {
      200: {
        description: "Delete single user successfully.",
      },
      400: {
        description: "Cannot Delete",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};
