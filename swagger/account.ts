export const createAccountSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Account created successfully.",
      },
      400: {
        description: "Input Fields Required.",
      },
      409: {
        description: "Account already exists.",
      },
    },
  },
};
export const verifyEmailSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully re-send email verification",
      },
      400: {
        description: "Sending email verification failed",
      },
    },
  },
};

export const signinAccountSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully logged in.",
      },
      400: {
        description: "Input Fields Required.",
      },
      402: {
        description: "Email verify is required",
      },
      404: {
        description: "User not found.",
      },
      405: {
        description: "Password incorrect.",
      },
    },
  },
};

export const currentAccountSwagger = {
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
    },
  },
};

export const changeAccountPasswordSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully changed.",
      },
      400: {
        description: "Input Fields Required.",
      },
    },
  },
};

export const forgotAccountPasswordSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description:
          "Successfully reset your password. Please update your password .",
      },
      400: {
        description: "Resetting password failed",
      },
      404: {
        description: "Account not found",
      },
    },
  },
};

export const resetAccountPasswordSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully reset your password.",
      },
      400: {
        description: "Input invalid",
      },
      404: {
        description: "Passcode incorrect",
      },
    },
  },
};
export const updateAccountPasswordSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Successfully update your password.",
      },
      400: {
        description: "Password input invalid",
      },
      404: {
        description: "Account not found",
      },
    },
  },
};

export const getAccountProfileSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Get accout profile Success!",
      },
      400: {
        description: "Password input invalid",
      },
      404: {
        description: "Not found!",
      },
      501: {
        description: "Request not implemented!",
      },
    },
  },
};
