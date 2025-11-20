import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API",
      version: "1.0.0",
      description: "API docs generated automatically",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Provide the JWT access token as: Bearer <token>",
        },
      },
    },
  },
  apis: [
    "./router/**/*.ts"
  ], // scan your route files automatically
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
export { swaggerUi };
