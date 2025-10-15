# API Testing Options

This project provides multiple options for API documentation and testing:

## Option 1: Postman Collection (Recommended)

A simpler, more practical approach is to use the auto-generated Postman collection:

### Benefits:

- **Automated Generation**: Collection is generated directly from your route files
- **No Documentation Overhead**: No need to write lengthy documentation comments
- **Easier to Maintain**: Updates automatically as your API evolves
- **Full Testing Capabilities**: Complete testing workflow with environment variables, pre-request scripts, etc.
- **Familiar Interface**: Many developers are already familiar with Postman

### How to Use:

```bash
# Generate a Postman collection from your actual routes
npm run postman-from-routes

# Import the generated file (postman_collection.json) into Postman
```

For detailed instructions, see [Postman Testing Guide](./postman-guide.md).

## Option 2: Swagger Documentation

For more comprehensive API documentation and in-browser testing:

### Benefits:

- **Interactive Documentation**: Self-hosted API documentation
- **In-Browser Testing**: Test API endpoints directly from the browser
- **OpenAPI Standard**: Industry-standard API documentation format

### How to Use:

Start your server and visit `/api-docs` in your browser.

For details on how we organize Swagger documentation to keep route files clean, see [Swagger Guide](./swagger-guide.md).

## Choosing the Right Approach

- **For Development & Testing**: Postman collection is usually more practical and requires less maintenance
- **For Public APIs**: Swagger provides better self-documentation for third-party developers
- **For Internal Teams**: You might want both - Postman for testing and Swagger for reference

You can use both approaches simultaneously, depending on your needs.