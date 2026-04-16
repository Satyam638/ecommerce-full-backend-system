const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "API documentation for E-commerce Backend System"
    },

    servers: [
      {
        url: "http://localhost:3000"
      }
    ],

    // ✅ ADD TAGS HERE
    tags: [
      { name: "Auth", description: "Authentication APIs" },
      { name: "Cart", description: "Cart operations" },
      { name: "Orders", description: "Order management" },
      { name: "Payment", description: "Payment integration" },
      { name: "Product", description: "Product management" }
    ],

    // ✅ JWT Security
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },

    // ✅ Apply globally
    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;