# **Backend API**

This project is a robust backend application developed for the "Computación en Internet III" course at Universidad Icesi. The primary goal is to build a scalable and secure RESTful API using a modern technology stack.

The application is designed to support core functionalities including:

- **User Management:** Full CRUD operations for users, with different roles and permissions.
- **Authentication & Authorization:** A secure system based on JSON Web Tokens (JWT) to protect API endpoints.
- **Modular Architecture:** Management of at least two additional interrelated modules (e.g., Projects and Tasks) with their own CRUD operations.
- **Comprehensive Testing:** Implementation of unit tests and integration tests to ensure code quality and reliability.

---

### **Authors**

- Juan Manuel Díaz Moreno - A00394477
- Santiago Valencia García - A00395902
- William Joseph Verdesoto Velez -

---

### **Core Technologies**

The project is built with the following technologies and tools:

- **Runtime Environment:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Environment Variables:** Dotenv
- **Development Tools:** Nodemon, ts-node

---

### **Getting Started**

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

#### **Prerequisites**

Make sure you have the following software installed on your system:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Git](https://git-scm.com/)

#### **Installation and Setup**

1.  **Clone the repository**
    Open your terminal and run the following command:

    ```bash
    git clone [https://github.com/ICESI-CI3/nodejs-nexus.git](https://github.com/ICESI-CI3/nodejs-nexus.git)
    cd nodejs-nexus
    ```

2.  **Install dependencies**
    Install all the required npm packages.

    ```bash
    npm install
    ```

3.  **Environment Configuration**
    The project uses a `.env` file to manage environment variables. Create a `.env` file in the root of the project by copying the example file.

    ```bash
    cp .env.example .env
    ```

    Now, open the `.env` file and fill in the required variables, such as the database connection string and JWT secret.

    ```env
    # Server Configuration
    PORT=3000

    # MongoDB Connection URL
    MONGO_URI=mongodb://localhost:27017/nexusdb

    # JWT Secret Key
    JWT_SECRET=your_super_secret_key
    ```

4.  **Running the Application**
    To start the server in development mode with automatic restarts on file changes, run:
    ```bash
    npm run dev
    ```
    The server will be available at `http://localhost:3000`.

---

### **Available Scripts**

This project includes the following scripts defined in `package.json`:

| Script          | Description                                                                   |
| :-------------- | :---------------------------------------------------------------------------- |
| `npm run dev`   | Starts the server in development mode using `nodemon` and `ts-node`.          |
| `npm run build` | Compiles the TypeScript code into JavaScript in the `/dist` directory.        |
| `npm run start` | Starts the production server from the compiled code in the `/dist` directory. |

---

### **Contribution Guidelines**

To maintain a consistent and organized workflow, this project adheres to the following guidelines.

#### **Branching Model: Git Flow**

The project follows the **Git Flow** branching model.

- `main`: This branch contains production-ready code. All commits on `main` should be tagged with a version number.
- `develop`: This is the main development branch where all completed features are merged. It serves as the integration branch for nightly builds.
- **Feature Branches:** All new features must be developed in their own branch, created from `develop`. The branch name should be prefixed with `feature/`, for example: `feature/user-authentication`.
- **Release Branches:** When `develop` has enough features for a release, a `release/` branch is created to prepare for a new production release.
- **Hotfix Branches:** These are created from `main` to quickly patch critical bugs in production.

#### **Commit Messages**

Commit messages must follow the **Conventional Commits** specification. This creates an explicit and readable commit history. Each commit message consists of a **type**, an optional **scope**, and a **subject**.

**Common types include:**

| Type       | Description                                                    |
| :--------- | :------------------------------------------------------------- |
| `feat`     | A new feature for the user.                                    |
| `fix`      | A bug fix for the user.                                        |
| `docs`     | Changes to the documentation only.                             |
| `style`    | Code style changes (formatting, missing semi-colons, etc.).    |
| `refactor` | A code change that neither fixes a bug nor adds a feature.     |
| `test`     | Adding missing tests or correcting existing tests.             |
| `chore`    | Changes to the build process or auxiliary tools and libraries. |

**Example:**
`feat(auth): implement user login endpoint`
