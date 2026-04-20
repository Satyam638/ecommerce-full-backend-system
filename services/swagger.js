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
      { url: "http://localhost:3000" }
    ],
    tags: [
      { name: "Auth", description: "Authentication APIs" },
      { name: "Cart", description: "Cart operations" },
      { name: "Orders", description: "Order management" },
      { name: "Payment", description: "Payment integration" },
      { name: "Product", description: "Product management" }
    ],
    components: {
      securitySchemes: {
        tokenAuth: {
          type: "apiKey",
          in: "header",
          name: "token"
        }
      }
    }
  },

  // 🔥 include controllers also
  apis: ["./routes/*.js", "./controllers/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;