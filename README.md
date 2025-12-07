
📁 File Sharing Application
A full-stack secure file sharing application built with React, Node.js, Express, and MongoDB. Upload files, share them with specific users or via secure links, and manage access with expiry dates.

🌟 Features
Core Features
•	User Authentication - Secure registration and login with JWT
•	File Upload - Single and bulk file uploads with drag-and-drop
•	File Management - View, download, and delete your files
•	User Sharing - Share files with specific registered users
•	Link Sharing - Generate secure shareable links
•	Access Control - Strict authorization checks on all file operations
•	Link Expiry - Set expiration dates for shared access
•	File Metadata - Display filename, type, size, and upload date

Security Features
•	JWT-based authentication
•	Password hashing with bcrypt
•	File type and size validation
•	Owner-based access control
•	Secure file storage
•	Authorization middleware on all routes

Tech Stack
Frontend
•	React 18 - UI library
•	Vite - Build tool and dev server
•	Tailwind CSS - Styling
•	Axios - HTTP client
•	Lucide React - Icons
Backend
•	Node.js - Runtime environment
•	Express - Web framework
•	MongoDB - Database
•	Mongoose - ODM
•	JWT - Authentication
•	Multer - File uploads
•	bcryptjs - Password hashing

📋 Prerequisites
Before you begin, ensure you have the following installed:
•	Node.js (v14 or higher) - Download
•	MongoDB (v4.4 or higher) - Download
•	npm or yarn - Comes with Node.js
•	Git (optional) - For cloning the repository

Check installations:
node --version   # Should show v14.0.0 or higher
npm --version    # Should show 6.0.0 or higher
mongod --version # Should show MongoDB version

🚀 Installation & Setup
1. Clone or Download the Project
# Using Git
git clone https://github.com/Devsama007/File-Share
cd file-sharing-app

# OR download and extract the ZIP file

2. Backend Setup
Step 1: Install Dependencies
cd Backend
npm install

Step 2: Create Environment File
Create a .env file in the Backend directory:
# Backend/.env

PORT=5000
MONGODB_URI=mongodb://localhost:27017/file-sharing-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

Important: Change JWT_SECRET to a strong, random string in production!

Step 3: Create Uploads Directory
# While in Backend directory
mkdir uploads

Step 4: Start MongoDB
Windows:
# Open Command Prompt as Administrator
Mongod

macOS:
brew services start mongodb-community

Verify MongoDB is running:
mongosh
# Should connect successfully
# Type 'exit' to quit

Step 5: Start Backend Server
# In Backend directory
Node server.js

# You should see:
# Server running on port 5000
# MongoDB connected

3. Frontend Setup
Step 1: Open New Terminal
Keep the backend server running and open a new terminal window.

Step 2: Install Dependencies
cd Frontend
npm install

Step 3: Start Frontend Development Server
npm run dev

# You should see:
# VITE v5.x.x ready in xxx ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose

4. Access the Application
Open your browser and navigate to:
Click the terminal link

Usage Guide
1. Create an Account
1.	Open http://localhost:3000
2.	Click "Don't have an account? Register"
3.	Fill in: 
o	Name: Your Name
o	Email: your@email.com
o	Password: minimum 6 characters
4.	Click "Register"

2. Upload Files
1.	After login, you'll see the dashboard
2.	Drag and drop files into the upload area, OR
3.	Click "Select Files" to browse
4.	Multiple files can be uploaded at once
5.	Supported formats: PDF, Images (JPG, PNG, GIF), CSV, DOC, DOCX, TXT, XLSX

3. Share Files
Option A: Share with Specific Users
1.	Click the Share icon on any of your files
2.	Click "Share with Users" tab
3.	Select one or more users from the list
4.	(Optional) Set an expiry date
5.	Click "Share with Selected Users"
Option B: Share via Link
1.	Click the Share icon on any of your files
2.	Click "Share Link" tab
3.	(Optional) Set an expiry date
4.	Click "Generate Share Link"
5.	Copy the generated link
6.	Share the link with anyone (they must have an account)

4. Access Shared Files
Via User Share:
•	Shared files appear in "Shared with Me" section
•	Click download to save
Via Link:
1.	Recipient opens the shared link
2.	Recipient has to login first to access the link
3.	After login, they'll see the file details page
4.	Click "Download File" to download

5. Download Files
•	Click the Download icon on any file
•	File will be saved to your default downloads folder

6. Delete Files
•	Click the Delete icon on your uploaded files
•	Confirm deletion
•	File and all its shares will be removed

Testing the Application
Test User Registration & Login
1.	Register User A: alice@test.com
2.	Register User B: bob@test.com
3.	Logout and login with each account

Test File Upload
1.	Login as Alice
2.	Upload a PDF file
3.	Upload multiple images at once
4.	Verify files appear in "My Files"

Test User Sharing
1.	Login as Alice
2.	Upload a file
3.	Share with Bob
4.	Logout, login as Bob
5.	Verify file appears in "Shared with Me"
6.	Download the file

Test Link Sharing
1.	Login as Alice
2.	Upload a file
3.	Generate share link
4.	Copy the link
5.	Logout, login as Bob
6.	Paste link in browser
7.	View and download file

Test Expiry
1.	Login as Alice
2.	Share file with expiry date in past
3.	Try to access as Bob
4.	Should show "expired" error

Test Authorization
1.	Try to access another user's file directly
2.	Should get "Access Denied" error

If you encounter any issues:
1.	Check the Troubleshooting section
2.	Review server logs in terminal
3.	Check browser console for errors
4.	Verify MongoDB is running
5.	Ensure all dependencies are installed