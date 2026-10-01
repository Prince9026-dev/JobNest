# JobNest 💼

JobNest is a web-based job portal that connects **students/candidates with HR/recruiters**. Candidates can create accounts, browse available jobs, apply for jobs, and track their application status. HR users can create job postings and manage applications.

## 🚀 Features

### 👨‍🎓 Candidate

* Candidate registration and login
* Browse available jobs
* View job details
* Apply for jobs
* Submit resume
* Track application status
* View accepted/rejected/pending applications

### 👨‍💼 HR / Recruiter

* HR registration and login
* Create job postings
* Add required skills to jobs
* View applications for posted jobs
* Accept or reject candidates

### 🔐 Authentication

* Student and HR role-based authentication
* Passport.js authentication
* Password hashing using bcrypt
* Session-based login

### 🗄️ Database

JobNest uses **MySQL** to store:

* Candidate information
* HR information
* Job postings
* Job skills
* Job applications
* Application status

## 🛠️ Technologies Used

* **Node.js**
* **Express.js**
* **EJS**
* **MySQL**
* **MySQL2**
* **Passport.js**
* **Passport-Local**
* **bcrypt**
* **Express Session**
* **Method Override**
* **EJS-Mate**
* **HTML**
* **CSS**
* **JavaScript**

## 📂 Project Structure

```text
JobNest/
│
├── app.js
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
│
├── routes/
│
├── views/
│
├── public/
│
├── config/
│
└── uploads/
```

> The exact folders may vary depending on the current project structure.

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the project

```bash
cd JobNest
```

### 3. Install dependencies

```bash
npm install
```

This automatically installs all dependencies listed in `package.json`.

### 4. Configure MySQL

Create a MySQL database named:

```sql
CREATE DATABASE jobnest_db;
```

Create the required tables according to the database structure used by the application.

### 5. Configure database credentials

Keep your database credentials private. If using environment variables, place them in a `.env` file.

**Do not upload `.env` to GitHub.**

### 6. Start the application

```bash
npm start
```

Or:

```bash
node app.js
```

The application will run on the port configured in `app.js`.

## 🔒 Security

Sensitive files and data should not be committed to GitHub.

The project uses `.gitignore` to exclude:

```text
node_modules/
.env
uploads/*
```

Passwords are hashed using bcrypt, and authentication is handled using Passport.js and sessions.

## 🎯 Future Improvements

* Candidate filtering based on skills
* Job search and advanced filters
* Email notifications
* HR dashboard improvements
* Candidate profile improvements
* Resume download/view functionality
* Improved UI/UX
* Deployment to a cloud platform

## 👨‍💻 Author

**Prince Agrawal**

B.Tech CSE (IoT)

## 📌 Project Status

**Completed / Portfolio Project**

JobNest was developed as a practical full-stack web development project to demonstrate backend development, authentication, database integration, routing, and job application workflows.
