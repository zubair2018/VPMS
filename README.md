# Visitor Pass Management System (VPMS)

A full-stack MERN project for managing visitor registrations, appointments, visitor passes, and gate entry/exit flow in an organization.

This project was built to make the visitor handling process faster, more organized, and easier to track. It supports role-based access for admin, employee, security staff, and public visitors. The application includes authentication, visitor registration, appointment approval, pass generation, and pass scanning.

## Project Overview

The system solves a common real-world problem in offices, colleges, companies, and gated organizations: visitor management is often handled manually, which can lead to long queues, missing records, weak security checks, and confusion between visitors, hosts, and gate staff.

This project digitizes that full flow:

- Visitors can register their visit details.
- Admin or staff can create and manage appointments.
- Approved visitors can receive a visitor pass.
- Security can scan passes for check-in and check-out.
- Different users see only the pages relevant to their role.

## Main Features

- User registration and login using JWT authentication.
- Role-based access control for admin, employee, security, and visitor.
- Visitor registration and visitor data management.
- Appointment creation, viewing, and status update.
- Visitor pass generation with QR code and PDF support.
- Pass scanning for check-in and check-out.
- Email and SMS notification support.
- Protected frontend routes using React Router.
- CSV export for pass records.

## Tech Stack

### Frontend

- React.js
- React Router DOM
- Axios
- Context API
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv

### Utilities

- Nodemailer for email
- SMS utility integration
- QR / PDF generation utility

## System Roles

| Role | Responsibility |
|------|----------------|
| Admin | Manage visitors, appointments, passes, and major records |
| Employee | Act as host for visitors and view relevant appointments |
| Security | Generate passes, scan passes, and monitor gate movement |
| Visitor | Register visit details and use issued pass |

## Folder Structure

```bash
vpms/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── App.js
└── README.md
```

## Modules Explained

### 1. Authentication Module

The authentication module handles user registration and login.

- Passwords are hashed before saving to the database.
- JWT token is created after successful login.
- The token is stored in local storage on the frontend.
- Protected routes check whether the user is logged in.
- Role-based access is used to restrict pages and actions.

### 2. Visitor Module

This module stores visitor information such as name, email, phone, purpose, and visit-related details.

- Visitors can be created from the public registration page.
- Admin users can view and manage visitor entries.
- Visitor data is used later in appointments and pass generation.

### 3. Appointment Module

This module connects a visitor to an employee host.

- An appointment includes visitor, host, visit date, notes, and status.
- Appointments can be pending, approved, rejected, or completed.
- Employees can see appointments related to them.
- Status can be updated from the dashboard.

### 4. Pass Module

This module generates visitor passes.

- A pass is linked to a visitor.
- It can optionally be linked to an appointment.
- A pass contains valid from and valid till time.
- QR code and PDF pass files are created.
- Pass data can be exported as CSV.

### 5. Scanning Module

This module is used mainly by security staff.

- First scan changes the pass from issued to checked-in.
- Second scan changes the pass from checked-in to checked-out.
- Each scan creates a log entry.
- This helps track visitor movement securely.

## Database Collections

The project uses MongoDB collections such as:

- Users
- Visitors
- Appointments
- Passes
- CheckLogs

These collections are connected through Mongoose references using IDs.

## API Overview

### Auth Routes

- `POST /api/auth/register`
- `POST /api/auth/login`

### Visitor Routes

- `GET /api/visitors`
- `POST /api/visitors`

### Appointment Routes

- `GET /api/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/:id/status`

### Pass Routes

- `GET /api/passes`
- `POST /api/passes`
- `POST /api/passes/scan`

### User Routes

- `GET /api/users?role=employee`

## How the Project Works

The full system works in this order:

1. A visitor registers their details.
2. A staff member creates an appointment with an employee host.
3. The appointment can be approved or rejected.
4. A visitor pass is generated for the visitor.
5. The visitor arrives at the gate.
6. Security scans the pass for check-in.
7. When the visitor leaves, security scans again for check-out.

This creates a complete digital trail of visitor entry and exit.

## Feedback Received and Improvements Done

During review, some important issues were identified in the project. These were corrected to improve both functionality and code quality.

### 1. Missing appointment status update route

**Problem:**
The frontend was calling:

```js
api.put(`/appointments/${id}/status`, { status });
```

But the backend route for this endpoint was missing.

**Fix done:**
The route below was added in `appointmentRoutes.js`:

```js
router.put('/:id/status', protect, authorizeRoles('admin', 'employee'), updateAppointmentStatus);
```

**Result:**
Appointment approval and rejection now work correctly from the frontend dashboard.

### 2. Missing users route for employee list

**Problem:**
The appointments page was loading employee hosts using:

```js
api.get('/users?role=employee');
```

But the backend had no `/api/users` route.

**Fix done:**
A user controller and user route were added, and `server.js` was updated:

```js
app.use('/api/users', userRoutes);
```

**Result:**
The employee dropdown now loads properly when creating appointments.

### 3. Inconsistent Axios usage

**Problem:**
Some frontend files were directly using `axios.post('http://localhost:5000/...')`, while other files were using a shared axios instance.

**Fix done:**
A common axios instance was used for API calls.

```js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});
```

**Result:**
API handling became cleaner, token injection became automatic, and deployment setup became easier.

### 4. Automatic token handling added

**Problem:**
Protected requests need the JWT token in the Authorization header.

**Fix done:**
An axios interceptor was used to attach the token automatically from local storage.

```js
config.headers.Authorization = `Bearer ${authData.token}`;
```

**Result:**
Protected routes work without manually attaching the token in every request.

### 5. Missing role-safe route protection on frontend

**Problem:**
Role-based access had to be properly enforced on the frontend.

**Fix done:**
`ProtectedRoute.jsx` was used to check login status and allowed roles before rendering pages.

**Result:**
Unauthorized users are redirected away from restricted pages.

### 6. Auth state persistence improvement

**Problem:**
Login state needed to remain available after page refresh.

**Fix done:**
Auth data was stored in local storage and restored in `AuthContext.jsx`.

**Result:**
Users remain logged in even after refresh until they log out.

### 7. Pass page UI bug fix

**Problem:**
There was a small class name mistake in the pass page button styling.

**Fix done:**
The class name was corrected from:

```jsx
className="btn secondary btn.small"
```

to:

```jsx
className="btn secondary small"
```

**Result:**
The pass PDF button styling now works correctly.

## Why These Changes Matter

These corrections were not just small syntax fixes. They improved the actual working of the project.

- Missing routes were preventing features from working.
- Common API handling reduced repeated code.
- Proper authentication flow made the app more secure.
- Role checks made the system more realistic.
- Better structure made the project easier to understand and maintain.

This is important because a project should not only look complete, it should also work correctly from end to end.

## Installation Steps

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file in backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Create a `.env` file in frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Future Scope

The project can be improved further by adding:

- OTP-based visitor verification
- Real QR scanner using device camera
- Admin analytics dashboard
- Search and filter improvements
- Better report generation
- Deployment with production CORS settings
- Audit logs for all admin actions

## Learning Outcomes

This project helped in understanding:

- MERN stack integration
- REST API development
- JWT authentication
- Role-based authorization
- MongoDB schema relationships
- Context API state management
- CRUD operations
- Real-life workflow design
- Debugging route mismatches between frontend and backend

## Conclusion

Visitor Pass Management System is a practical full-stack project that demonstrates authentication, authorization, CRUD operations, document generation, notifications, and secure visitor tracking in one application.

The feedback-based improvements made the project stronger, more complete, and more teacher-ready by fixing actual workflow issues instead of only changing code style.