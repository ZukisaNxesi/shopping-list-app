# 🛒 Shopping List Management App

A full-stack shopping list application with user authentication, image uploads, and real-time price calculation.

## Features

- ✅ User authentication (Sign up/Login)
- ✅ Create, rename, and delete shopping lists
- ✅ Add items with name, price, and pictures
- ✅ Automatic price calculation
- ✅ Mark items as purchased
- ✅ Edit or delete items
- ✅ Image upload via Cloudinary
- ✅ Supabase database
- ✅ Responsive Material-UI design

## Tech Stack

### Backend
- Node.js & Express
- Supabase (PostgreSQL, Authentication)
- Cloudinary (Image storage)
- JWT for authentication

### Frontend
- React.js
- Material-UI (MUI)
- React Router v6
- Axios for API calls

## Setup Instructions

### Backend Setup
1. Navigate to backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with your credentials
4. Run: `npm start`

### Frontend Setup
1. Navigate to frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Create `.env` file with: `REACT_APP_API_URL=http://localhost:5000/api`
4. Run: `npm start`

## Environment Variables

### Backend (.env)