# Document Authentication App

## Overview
The Document Authentication App is a web application designed to verify original documents.

## Prerequisites
- Ensure you have Git installed on your system.
- Make sure you have Node.js and npm installed for the frontend.
- Python and pip should be installed for the backend.

## Installation Instructions

### Cloning the Repository
1. Open your terminal and navigate to your preferred directory.
2. Clone the repository using the following command:
   ```bash
   git clone https://github.com/ronspringer/Document-Authentication.git
3. Change to the master branch:
   ```bash
   git checkout master

### Setting Up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
2. Install the required libraries for the React.js frontend
   ```bash
   npm install
3. Start the frontend server
   ```bash
   npm run start

### Setting Up the Backend
1. Open another terminal and navigate to the backend directory
   ```bash
   cd backend/app
2. Install the required libraries for the Django backend
   ```bash
   pip install -r requirements.txt
3. Run migrations to set up the SQLite database
   ```bash
   python manage.py migrate
4. Replace db.sqlite3 file in backend/app/ diretory with db.sqlite3 in the zip folder
5. Start the Django backend server
   ```bash
   python manage.py runserver
