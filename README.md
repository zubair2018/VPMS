# Visitor Pass Management System (MERN)

A full-stack Visitor Pass Management System built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The app helps organizations manage visitors, appointments, passes, and entry/exit logs from a single dashboard.

## Features

- User authentication with role-based access (admin, security, employee, visitor)
- Visitor registration with photo and ID proof upload
- Appointment creation and mapping to visitors and hosts
- Visitor pass generation with unique pass number, QR code and PDF
- Pass scanning page (manual input, can be extended to camera scanner)
- Check-in / check-out logging for each scan
- CSV export for visitor reports
- SMS notification to visitors when a pass is generated (using Twilio)
- Simple, responsive admin dashboard layout

## Tech Stack

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express.js, JWT auth
- **Database:** MongoDB + Mongoose
- **Other:** Multer for file uploads, Twilio for SMS, QRCode & PDF libraries for pass generation

## Project Structure

>frontend
>backend
.gitignore
package-lock.json
package.json
>screenshots

## Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB running locally or a MongoDB Atlas URI
- Twilio account (optional, only if SMS feature is enabled)


# install backend
cd backend
npm install

# install frontend
cd ../frontend
npm install

## Environment Variables



### Start backend

cd backend
npm run dev

### Start frontend

cd frontend
npm run dev

The frontend usually runs on `http://localhost:3000` 
and backend on `http://localhost:5000`.

## Main Modules

### Authentication

The system supports login and registration with role-based routing. Protected routes are handled on the frontend using `ProtectedRoute.jsx` and on the backend using auth middleware.

### Visitors

Admins or authorizeRolesd users can create and manage visitor records, upload visitor photo and ID proof, search records, and export visitor data as CSV.

### Appointments

Appointments can be created to map visitors with hosts/employees and track visit purposes, dates, and approvals.

### Passes

Passes are generated with a unique pass number. Each pass can include QR code data and a PDF file for gate verification.

### Scan / Check-in / Check-out

Security or admin users can record pass scans. On first scan, the pass becomes checked-in, and on the next scan it becomes checked-out. Logs are stored in the `CheckLog` model.

### SMS Notifications

If Twilio is configured, the system sends an SMS to the visitor when a pass is generated.

## Testing Flow

Use this order while testing the project:

1. Register or log in as admin
2. Create a visitor
3. Create an appointment
4. Generate a pass
5. Open the scan page and record check-in/check-out
6. Verify MongoDB entries and UI updates
7. Test SMS delivery if Twilio is enabled

## Future Improvements

- Live camera QR scanner integration
- Email notifications
- Better dashboard analytics and charts
- Employee dropdown instead of manual host ID entry
- Better validation and status filters
- Deployment on Render + Vercel/Netlify

## Author

Created as a MERN stack academic/project application for visitor and pass management.