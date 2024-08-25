
# File Management Application

This project is a file management application that allows users to log in, upload multiple files, view files, and download files. It is built with a React frontend and a Spring Boot backend.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Java 17+** (for running the Spring Boot application)
- **Node.js** and **npm** (for running the React frontend)
- **PostgreSQL** (for the database)

## Setup and Running

### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/RolvinNoronha/file-uploader.git
```

### 2. Configure PostgreSQL:

Create a new PostgreSQL database and Update the application.properties file in the src/main/resources directory with your PostgreSQL database details, jwt secrets, aws credentials and client url

```bash
spring.datasource.url=jdbc:postgresql://localhost:5432/yourdatabase
spring.datasource.username=yourusername
spring.datasource.password=yourpassword
```

```bash
spring.app.jwtSecret=jwt_secret
spring.app.jwtExpirationMs=jwt_expiration
```

```bash
aws.s3.bucketName=your_bucketname
aws.s3.accessKey=your_accesskey
aws.s3.secretKey=your_secretkey
aws.s3.region=your_region
```

```bash
client.url.one=http://localhost:5173/
```

### 3. Build and Run the Backend.

Navigate to the backend directory and build the Spring Boot application:

```bash
cd fileupload
./mvnw clean install
```

Run the Spring Boot application:

```bash
./mvnw spring-boot:run
```

The backend server will start on http://localhost:8080 by default

### 3. Setup the Frontend

Install Dependencies. Navigate to the frontend directory and install the required npm packages:

```bash
cd fileupload-client
npm install
```

Run the React Application. Start the React development server:

```bash
npm run dev
```

The frontend application will be available at http://localhost:5173/ by default.

### Demo
https://drive.google.com/file/d/19CP9tv_eL4Yk3jSfZ3zqsTeUVSgGoAqX/view?usp=sharing
