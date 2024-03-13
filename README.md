## Simple Ecommerce Site API

This project showcases the development of a simple ecommerce app to demonstrate coding techniques and a diverse technology stack.

Technology Stack:

➢ Node.js
➢ koa
➢ knex.js
➢ mysql
➢ joi
➢ bcrypt
➢ jsonwebtoken
➢ config
➢ dotenv
➢ lodash
➢ moment
➢ winston
➢ jest
➢ nodemon
➢ supertest

## Installation

1. Install node modules

   ```
   npm intsall
   ```
2. Configure the .env file and change the desired environment details.

   ```
   cp .env.sample .env
   ```

```
# MySQL Connection
DB_HOST=simple-ecommerce-site_mysql
DB_USER=ecommerce
DB_PASSWORD=pwdnac255
DB_NAME=simple-ecommerce

# Json Web Token
ECOM_JWT_PRIVATE_KEY=simple-ecommerce-site**
```

3. Configure credentials or settings in the current environment.

    config/

    * default.json - default configuration settings

    * development.json - configuration settings for development

    * production.json - configuration settings for production

    * custom-environment-variables.json - This will override the above configuration and retrieve configuration from the server environment variables.

    * test.json - Configuration settings for integration testing
