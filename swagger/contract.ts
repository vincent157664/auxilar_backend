export const makeContractSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Contract created successfully!",
      },
      400: {
        description: "Input Fields Required.",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Not found!",
      },
      409: {
        description: "Contract already exist!",
      },
      500: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};
export const completeContractSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Contract completed successfully!",
      },
      400: {
        description: "Input Fields Required.",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Not found!",
      },
      409: {
        description: "Contract already exist!",
      },
      500: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};
export const getContractSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Get contract success",
      },
      404: {
        description: "Contract does not exist",
      },
      500: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};

export const updateContractSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Update contract success",
      },
      400: {
        description: "Input Fields Required.",
      },
      404: {
        description: "Contract does not exist",
      },
      500: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};

export const deleteContractSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Delete contract success",
      },
      404: {
        description: "Contract does not exist",
      },
      500: {
        description:
          "Sorry, something went wrong. Please refresh the page and try again.",
      },
    },
  },
};
