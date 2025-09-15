# TicketHub API

TicketHub is a robust backend application developed for the "Computación en Internet III" course at Universidad Icesi. The project is a scalable and secure RESTful API designed to manage event ticketing, from event creation and user management to ticket purchasing and validation.

The application is built using a modern technology stack, emphasizing type safety, modular architecture, and comprehensive testing to ensure reliability and maintainability.

### Authors

-   Juan Manuel Díaz Moreno - A00394477
-   Santiago Valencia García - A00395902
-   William Joseph Verdesoto Velez - A00395664

---

### Core Technologies

The project is built with the following technologies and tools:

-   **Runtime Environment:** Node.js
-   **Language:** TypeScript
-   **Framework:** Express.js
-   **Database:** MongoDB with Mongoose ODM
-   **Authentication:** JSON Web Tokens (JWT)
-   **Testing:** Jest
-   **Development Tools:** Nodemon, ts-node, Dotenv

---

### Features

-   **User and Role Management:** Full CRUD operations for users and roles, with a permission-based access control system.
-   **Authentication & Authorization:** A secure, stateless authentication system using JWT to protect API endpoints and authorize actions based on user roles (`admin`, `organizer`, `buyer`).
-   **Modular Architecture:** The application is divided into logical modules (Auth, User, Event, Ticket, Purchase) for a clear separation of concerns.
-   **Event Management:** Functionality for organizers to create, manage, and publish events.
-   **Ticketing System:** Endpoints for creating ticket types for events, validating them via unique codes, and managing their availability.
-   **Purchase Flow:** A complete workflow for users to purchase tickets for published events, which generates unique tickets for each purchase.

---

### Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

#### Prerequisites

Ensure you have the following software installed on your system:

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)
-   [Docker](https://www.docker.com/) (for the database)
-   [Git](https://git-scm.com/)

#### Installation and Setup

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
    Create a `.env` file in the project root. You can copy the example file to get started.
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and fill in the required variables. For local development, the following configuration is recommended:
    ```env
    # Server Configuration
    PORT=3000

    # MongoDB Connection URL for Docker
    MONGO_URI=mongodb://admin:password@localhost:27017/tickethubdb?authSource=admin

    # JWT Secrets (replace with long, random strings)
    JWT_SECRET="your_super_secret_key_for_access_tokens"
    JWT_REFRESH_SECRET="your_other_super_secret_key_for_refresh_tokens"
    ACCESS_TOKEN_EXPIRES_IN="15m"
    REFRESH_TOKEN_EXPIRES_IN="7d"
    ```

4.  **Database Setup**
    The application requires a running MongoDB instance.

    -   **Start MongoDB with Docker:** Run the following command in your terminal. This only needs to be done once.
        ```bash
        docker run --name nexus-mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password -d mongo
        ```
    -   **Seed the Database:** Before the first run, execute the seed script to create the essential roles (`admin`, `organizer`, `buyer`) and the initial admin user.
        ```bash
        npm run db:seed
        ```

        **Note:** Since the project has already been deployed to the cloud, if you plan to use the cloud deployment you **must not run the seed script**, as the database is already populated in that environment.

5.  **Running the Application**
    To start the server in development mode (with automatic restarts), run:
    ```bash
    npm run dev
    ```
    The server will be available at `http://localhost:3000`.

---

### Testing

The project includes a comprehensive suite of unit tests to ensure code quality and reliability.

-   **Install testing dependencies (recommended):**
    ```bash
    npm install --save-dev supertest
    ```

-   **Run all tests:**
    ```bash
    npm test
    ```

-   **Generate a coverage report:**
    To check if the project meets the 80% coverage requirement, run:
    ```bash
    npm test -- --coverage
    ```
    A detailed HTML report will be generated in the `coverage/` directory.

_Current coverage: approximately **90%**_    

<img width="1361" height="648" alt="image" src="https://github.com/user-attachments/assets/24027065-c766-4484-ab81-230ba0814bc4" />

---

### Postman Integration

A Postman collection is included in the `resources/` directory to facilitate API testing.

1.  **Create an Environment:** In Postman, create a new environment. Add a variable named `baseURL` with the value `http://localhost:3000/api/v1`.  
    Since the project has also been deployed to the cloud, you can alternatively set the `baseURL` to the deployed endpoint: `https://nodejs-nexus.onrender.com/api/v1`.

2.  **Import the Collection:** Click on "Import" and select the `.json` file located in the `resources/` folder of this project. The imported requests will automatically use the `baseURL` variable.

---

### API Endpoints

The base URL for all endpoints is `/api/v1`.

#### **Auth Module**

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Registers a new user. |
| `POST` | `/auth/login` | Logs in a user, returns JWTs. |
| `POST` | `/auth/refresh` | Refreshes an access token. |
| `POST` | `/auth/logout` | Logs out a user (client-side token removal). |

#### **User & Role Module**

| Method | Endpoint | Description | Authorization |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Gets the current authenticated user's profile. | Authenticated |
| `PUT` | `/users/me` | Updates the current user's profile. | Authenticated |
| `GET` | `/users` | Retrieves a list of all users. | Admin |
| `GET` | `/users/:id` | Gets a specific user by ID. | Admin |
| `PUT` | `/users/:id` | Updates a specific user by ID. | Admin |
| `DELETE`| `/users/:id` | Deletes a specific user by ID. | Admin |
| `POST` | `/roles` | Creates a new role. | Admin |
| `GET` | `/roles` | Retrieves a list of all roles. | Admin |
| `GET` | `/roles/:id` | Gets a specific role by ID. | Admin |
| `PUT` | `/roles/:id` | Updates a specific role by ID. | Admin |
| `DELETE`| `/roles/:id` | Deletes a specific role by ID. | Admin |

#### **Event Module**

| Method | Endpoint | Description | Authorization |
| :--- | :--- | :--- | :--- |
| `GET` | `/events` | Retrieves a list of events (published only for public). | Public |
| `GET` | `/events/:id` | Gets a specific event by ID. | Public |
| `GET` | `/events/organizer/:organizerId` | Gets all events for a specific organizer. | Authenticated |
| `POST` | `/events` | Creates a new event. | Organizer (`create_event` permission) |
| `PUT` | `/events/:id` | Updates an event. | Organizer / Admin (`edit_event` permission) |
| `DELETE`| `/events/:id` | Deletes an event. | Organizer / Admin (`delete_event` permission) |

#### **Purchase & Ticket Module**

| Method | Endpoint | Description | Authorization |
| :--- | :--- | :--- | :--- |
| `POST` | `/purchases` | Creates a new purchase and associated tickets. | Buyer (`buy_ticket` permission) |
| `POST` | `/tickets` | Creates a new ticket. | Admin |
| `GET` | `/tickets` | Retrieves a list of tickets. | Admin |
| `GET` | `/tickets/:id` | Gets a specific ticket by ID. | Admin |
| `PUT` | `/tickets/:id` | Updates a ticket. | Admin |
| `DELETE`| `/tickets/:id` | Deletes a ticket. | Admin |
| `GET` | `/tickets/validate/:ticketCode` | Validates a ticket by its code. | Organizer / Admin |
| `POST` | `/tickets/use/:ticketCode` | Marks a ticket as used. | Organizer / Admin |

---

### **Deployment**

This project is deployed to the cloud to ensure continuous availability.

-   **Database**: The production database is hosted on **MongoDB Atlas**, utilizing their free M0 cluster tier.
-   **Application**: The Node.js API is deployed as a Web Service on **Render**, connected directly to the GitHub repository for continuous deployment. Environment variables, including the `MONGO_URI` for Atlas and JWT secrets, are securely configured in the Render dashboard.

### **Cloud Deployment**

In addition to local setup, this project has been deployed to the cloud for public access.  
You can access the live API at the following link:

[https://nodejs-nexus.onrender.com](https://nodejs-nexus.onrender.com)

-   **Base URL for API requests:**  
    ```
    https://nodejs-nexus.onrender.com/api/v1
    ```
-   **Note:** Since the production database is already seeded with the required roles and an initial admin user, **you must not run the seed script** (`npm run db:seed`) when using the cloud deployment.

---

### **Contribution Guidelines**

To maintain a consistent and organized workflow, this project adheres to the following guidelines.

#### **Branching Model: Git Flow**

The project follows the **Git Flow** branching model.

-   `main`: Contains production-ready code.
-   `develop`: The main development branch where all completed features are merged.
-   **Feature Branches:** All new features must be developed in their own branch, created from `develop` (e.g., `feature/user-authentication`).

#### **Commit Messages**

Commit messages must follow the **Conventional Commits** specification to ensure a readable and explicit commit history.

| Type | Description |
| :--- | :--- |
| `feat` | A new feature for the user. |
| `fix` | A bug fix for the user. |
| `docs` | Changes to the documentation only. |
| `style` | Code style changes (formatting, etc.). |
| `refactor` | A code change that neither fixes a bug nor adds a feature. |
| `test` | Adding missing tests or correcting existing tests. |
| `chore` | Changes to the build process or auxiliary tools. |

**Example:**
`feat(auth): implement user login endpoint`
