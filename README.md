# Premium JobPortal - Full-Stack Application

A beautiful, feature-rich, full-stack Job Portal web application with a responsive user interface built using React, and a powerful API backend built using Node.js, Express, and MongoDB.

---

## Folder Structure

```
jobBoard/
├── backend/                  # Node.js/Express API service
│   ├── config/               # Database configurations
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth and upload helpers
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # API endpoint routing declarations
│   ├── uploads/              # Local storage for resume documents (Auto-created)
│   └── server.js             # API service starting entry
└── frontends/                # React Single-Page Application
    ├── public/               # Static assets
    └── src/
        ├── components/       # Reusable UI elements (Navbar, JobCard, SearchFilters)
        ├── context/          # Auth state manager
        ├── pages/            # Application page views
        ├── App.js            # Router configuration and guards
        ├── index.css         # Premium custom styling design
        └── index.js          # React DOM mounting
```

---

## Step-by-Step Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (Default port: `27017`) or a MongoDB Atlas connection string.

---

### Part 1: Backend API Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Open or edit the `backend/.env` file. It should contain:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/jobboard
   JWT_SECRET=your_jwt_secret_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```
   > [!NOTE]
   > - If `EMAIL_USER` or `EMAIL_PASS` are left empty, the application will print mock emails directly to the server terminal console or set up a developer testing account via Ethereal Email.

4. **Start the API Server**:
   ```bash
   npm start
   ```
   You should see `MongoDB Connected` and `Server running on port 5000` logged in the terminal.

---

### Part 2: Frontend React Setup

1. **Navigate to the Frontend Directory**:
   From the project root:
   ```bash
   cd frontends
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   ```
   The browser should launch automatically and load the application at `http://localhost:3000`.

---

## Running and Verifying the Features

### 1. Register Accounts
- Select **Sign Up** from the navigation bar.
- Create a **Job Seeker** account (e.g. John Doe, `john@example.com`).
- Create an **Employer** account (e.g. Acme Recruiter, `recruiter@acme.com`).
- *To create an **Admin** user*: You can register a user and manually change their `role` field to `"admin"` in your MongoDB database (e.g. via MongoDB Compass or terminal Mongo shell), or register an account with `role: "admin"` directly using Postman/curl hitting `POST /api/auth/register`.

### 2. Post Jobs (Employer Flow)
- Log in as your **Employer** account.
- Select **Post Job** from the navbar, or click "+ Post New Opening" from your Employer Panel.
- Fill out the form fields (Title, Type, Location, Salary, Skills, Description) and click **Post Opening**.

### 3. Search and Filter (Job Seeker Flow)
- Go to **Explore Jobs** (Homepage).
- Use the sidebar filters to refine by Job Type (e.g., Remote, Full-time), Experience Level (Entry, Mid, Senior), Salary Range, or search keywords.
- Click **Apply Filters** to see results update instantly with paginated pages.

### 4. Bookmark and Apply
- Click **View Details** on any job card.
- Click **Save** to add it to your Bookmarks list (viewable under My Dashboard).
- Click **Apply for Job** to open the submission form. Upload a PDF/Word resume, write a cover letter, and click submit.
- The employer will receive an email alert (printed to the backend console ifSMTP is mock).

### 5. Application Status Updates
- Log in as the **Employer** account and go to **Employer Panel** &rarr; **Received Applications**.
- View the applicant details, download their resume, and change their selection status (e.g. to "Interview").
- The applicant's dashboard updates in real-time and sends an automated notification email.

### 6. Admin Panel Mod
- Log in as an **Admin** account.
- Navigate to **Admin Panel** to see application tracking charts, delete spam jobs, or ban/delete inactive user accounts.
