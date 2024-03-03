# Simple Storage Service

## Table of Contents

- [Description](#description)
- [Environment Setup](#environment-setup)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Dependencies](#dependencies)
- [Author](#author)

## Description

The Secure Cloud Storage (SCS) system is a robust platform designed to provide users with a secure and efficient way to store and manage their files in the cloud. It offers a comprehensive set of features to ensure data security, accessibility, and organization. Below are the key functionalities and extensions of the SCS system:

### Core Features:

- **User Authentication:** Users can register, login, and manage their accounts securely.
- **File Upload and Download:** Users can upload files to their storage space and download them as needed, ensuring the integrity and security of the uploaded files.
- **File Organization:** Users can organize their files into directories or folders, similar to the bucket and object hierarchy in Amazon S3.
- **File Listing and Search:** Users can view a list of their uploaded files and search for specific files based on filenames and metadata.
- **Permissions and Access Control:** The system includes an access control mechanism that dictates who can access specific files, supporting different types of access such as private, public, and shared.
- **File Versioning:** Users have the ability to manage different versions of a file and roll back to previous versions when necessary.
- **Metadata Management:** Users can add metadata to their files to enhance searchability.
- **File Deduplication:** Implements file deduplication to maximize storage efficiency. The system recognizes duplicate files during uploads and avoids storing multiple copies of the same file.

## Getting Started

1. **Clone the Repository:**
   ```bash
   git clone git@github.com:JRajz/simple_storage.git
   ```


2. **Navigate to the Project Directory:**
  ```bash
   cd simple_storage
   ```
   
3. **Install Dependencies:**
  ```bash
   npm install
   ```
4. **Configure Environment Variables:**
  - Create a .env file in the root directory.
  - Use the provided .env.sample file as a reference to set up your environment variables. Modify it as needed for your configuration.

5.  **Set Up MySQL and Redis:**

  - Follow the instructions provided to set up [MySQL](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04) and [Redis](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04) on your server.
  - Once MySQL and Redis are installed and configured, update the .env file with the appropriate database connection details and Redis server information.

5. **Start the API Server:**
  ```bash
  npm start
  ```
6. **Access the API:**

  - Once the server is running, you can access the API endpoints using the base URL http://localhost:3000.
  - Create a Postman environment with the following variables:
    - `baseUrl`: http://localhost:3000
    - `token`: 
  - Import the provided [Postman Collection](https://www.postman.com/cryosat-cosmonaut-54527758/workspace/development/collection/22854732-87ade348-3306-4b0c-87fe-2eb64ec41459?action=share&creator=22854732) to quickly set up and test the API endpoints.

Use tools like Postman or curl to interact with the API endpoints.

### API Endpoints

### Health Check
#### 1. Status
- **Method:** `GET`
- **Path:** `/status`
- **Description:** Check server status.

### User Management

#### 1. Signup

- **Method:** `POST`
- **Path:** `/users/signup`
- **Description:** Creates a new user account.
- **Request Body:** JSON

  ```json
  {
    "name": "string (required)",
    "email": "email (required)",
    "password": "alphanumeric (required)"
  }
  ```

- **Response:**
  - `201 Created`: The user account was created successfully.
  - `400 Bad Request`: Invalid or missing required fields in the request body.
  - `409 Conflict`: Email address already exists.

#### 2. Signin

- **Method:** `POST`
- **Path:** `/users/signin`
- **Description:** Log in an existing user.
- **Request Body:** JSON
  ```json 
  {
    "email": "user2@gmail.com",
    "password": "12345678"
  }
  ```

- **Returns:** JWT token to authenticate subsequent requests.
- **Response Codes:**
  - `200 OK`: Successfully signed in and returned with JWT token.
  - `400 Bad Request`: Miss
  - `401 Unauthorized`: Invalid credentials provided.

#### 3. Signout

- **Method:** `POST`
- **Path:** `/users/signout`
- **Description:** Log out the current user.
- **Authorization:** Bearer Token

#### 4. Profile

- **Method:** `GET`
- **Path:** `/users/profile`
- **Description:** Log out the current user.
- **Authorization:** Bearer Token
- **Returns:** User details

#### 5. Fetch user by email

- **Method:** `GET`
- **Path:** `/users`
- **Description:** Log out the current user.
- **Authorization:** Bearer Token
- **Query Params:** email (string)
  - `email` (string): The email address of the user to fetch.
- **Returns:** User details

### Directory Operations

#### 1. Create Directories

- **Method:** `POST`
- **Path:** `/directories`
- **Description:** Create a new directory.
- **Authorization:** Bearer Token
- **Request Body:** JSON
  ```json
  {
    "name": "string (required)" // Name of the directory
    "directoryId": "id (optional)"
  }
  ```
- **Returns:** Directory Id

#### 2. Update Directory

- **Method:** `PUT`
- **Path:** `/directories/:directoryId`
- **Description:** Update the name of a directory.
- **Authorization:** Bearer Token
- **Path Variables:** 
  - `directoryId` (ID of the directory)
- **Request Body:** JSON
  ```json
  {
    "name": "string (required)" // Name of the directory
  }
  ```

#### 3. Delete Directory

- **Method:** `DELETE`
- **Path:** `/directories/:directoryId`
- **Description:** Delete a directory.
- **Authorization:** Bearer Token
- **Path Variables:** 
  - `directoryId` (ID of the directory)

#### 4. Get Directories

- **Method:** `GET`
- **Path:** `/directories`
- **Description:** Get all directories.
- **Authorization:** Bearer Token
- **Query Params:** email (string)
  - `directoryId` (id, optional): include directory id to fetch its sub directories else Returns root directories.
- **Returns:** Directories

### File Operations

#### 1. Fetch User files

- **Method:** `GET`
- **Path:** `/files`
- **Description:** Fetch all user files.
- **Authorization:** Bearer Token
- **Query Params:** email (string)
  - `directoryId` (id, optional): include directory id to fetch its files else returns files in root directory.

- **Returns:** Files

#### 2. Search User files

- **Method:** `GET`
- **Path:** `/files/search`
- **Description:** Fetch all user files.
- **Authorization:** Bearer Token
- **Query Params:** email (string)
  - `search` (string) (min: 3 characters): search name and description.
  - `page` (number) (min 1 - optional) - By default 1

- **Returns:** Searched Files

#### 3. User Access Files

- **Method:** `GET`
- **Path:** `/files/shared`
- **Description:** Fetch user access files by others.
- **Authorization:** Bearer Token
- **Returns:** Access Files

#### 4. Upload File

- **Method:** `POST`
- **Path:** `/files/upload`
- **Description:** Upload a file.
- **Authorization:** Bearer Token
- **Request Body:** Form Data
  - `file` (file): Insert a file that needs to be uploaded
  - `name` (string): File name
  - `description` (string): File Description 
  - `directoryId` (Id, Optional) - Place in which file need to be uploaded

#### 5. Download File

- **Method:** `GET`
- **Path:** `/files/:id/download`
- **Description:** Download a file.
- **Authorization:** Bearer Token
- **Path Variables:** 
  - `id` (ID of the file)

#### 6. Update File MetaData

- **Method:** `PUT`
- **Path:** `/files/:id`
- **Description:** Update metadata of a file.
- **Authorization:** Bearer Token
- **Path Variables:** 
  `id` (ID of the file)
- **Request Body:** JSONS
  ```json
  {
      "name": "string (required)", // File name,
      "description: "string (required)" // File description
  }
  ```

#### 7. Delete File

- **Method:** `DELETE`
- **Path:** `/files/:id`
- **Description:** Delete a file.
- **Authorization:** Bearer Token
- **Path Variables:** 
  - `id` (ID of the file)

#### 8. Update File (File Versionioning)

- **Method:** `POST`
- **Path:** `/files/upload/versions/:id`
- **Description:** Upload a new version of an existing file.
- **Authorization:** Bearer Token
- **Path Variables:** 
  - `id` (ID of the file)
- **Request Body:** Form Data
  - `name` (string, required): Name of the file.
  - `description` (string, required): Description of the file.
  - `file` (file, required): The file to be uploaded.

#### 9. Get File Versions

- **Method:** `GET`
- **Path:** `/files/:id/versions`
- **Description:** Get all versions of a file.
- **Authorization:** Bearer Token
- **Path Variables:** 
  - `id` (ID of the file)
- **Response:** All file versions

#### 10. Restore File Version

- **Method:** `POST`
- **Path:** `/files/:id/revert/:versionId`
- **Description:** Restore a specific version of a file.
- **Authorization:** Bearer Token
- **Path Variables:**
  - `id`: ID of the file
  - `versionId`: ID of the version

#### 11. Set File Access

- **Method:** `POST`
- **Path:** `/files/:id/access`
- **Description:** Set access permissions for a file.
- **Authorization:** Bearer Token
- **Path Variables:** `id` (ID of the file)
- **Request Body:** Form Data
  - `accessType` (string, required): Type of access (e.g., "public", "private", "partial")
  - `allowedUserIds` (array of integers, only for accessType partial): IDs of users allowed access.

#### 12. Get all access users File Access

- **Method:** `Get`
- **Path:** `/files/:id/access/users`
- **Description:** Get all file access users.
- **Authorization:** Bearer Token
- **Path Variables:** 
  - `id` (ID of the file)

#### 13. Remove User File Access

- **Method:** `DELETE`
- **Path:** `/files/:id/access/:userId`
- **Description:** Remove access for a specific user to a file.
- **Authorization:** Bearer Token
- **Path Variables:**
  - `id`: ID of the file
  - `userId`: ID of the user


### Common Response Format
```json
{
    "success": true/false,
    "message": "success/error message",
    "statusCode": "success/error code",
    "data": {},
    "rows": num // only for paginated Api's
}
```

## Dependencies

- [bcrypt](https://www.npmjs.com/package/bcrypt): Library for hashing passwords.
- [celebrate](https://www.npmjs.com/package/celebrate): Express middleware for request validation.
- [cors](https://www.npmjs.com/package/cors): Middleware for enabling Cross-Origin Resource Sharing (CORS).
- [dotenv](https://www.npmjs.com/package/dotenv): Module for loading environment variables from a `.env` file.
- [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for Node.js.
- [helmet](https://www.npmjs.com/package/helmet): Middleware for securing HTTP headers.
- [http-status-codes](https://www.npmjs.com/package/http-status-codes): Utility library for HTTP status codes.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): Library for generating and verifying JSON Web Tokens (JWT).
- [morgan](https://www.npmjs.com/package/morgan): HTTP request logger middleware.
- [multer](https://www.npmjs.com/package/multer): Middleware for handling multipart/form-data, primarily used for file uploads.
- [mysql2](https://www.npmjs.com/package/mysql2): MySQL client for Node.js.
- [path](https://www.npmjs.com/package/path): Utility module for handling file paths.
- [pretty-error](https://www.npmjs.com/package/pretty-error): Library for formatting JavaScript errors with pretty printing.
- [redis](https://www.npmjs.com/package/redis): Redis client for Node.js.
- [sequelize](https://www.npmjs.com/package/sequelize): Promise-based Node.js ORM for MySQL, PostgreSQL, SQLite, and MSSQL.
- [winston](https://www.npmjs.com/package/winston): Versatile logging library for Node.js.
- [winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file): Transport for rotating log files in Winston.


## DevDependencies

- [eslint](https://www.npmjs.com/package/eslint): Tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
- [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb): ESLint shareable config for Airbnb's style guide.
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier): Turns off all rules that are unnecessary or might conflict with Prettier.
- [eslint-plugin-node](https://www.npmjs.com/package/eslint-plugin-node): Additional ESLint's rules for Node.js.
- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier): Runs Prettier as an ESLint rule.
- [nodemon](https://www.npmjs.com/package/nodemon): Utility that monitors for changes in files and automatically restarts the server.
- [prettier](https://www.npmjs.com/package/prettier): Opinionated code formatter for JavaScript and TypeScript.

These dependencies are used during development for linting, testing, and code formatting.

## Author

- [Jishnu Raj](https://github.com/JRajz)