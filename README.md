# RentOrBuyHouses

Angular frontend + Node.js REST API + MongoDB for a real-estate app (rent or buy listings).

## How to Run the Project

Use these exact steps after cloning from GitHub.

1. Clone the repository

```bash
git clone <your-repo-url>
cd Angular-Project-2026
```

2. Install dependencies

```bash
npm install
```

3. Start the application

```bash
npm start
```

4. Open the application

http://localhost:4200

Notes:

- The frontend runs on http://localhost:4200
- The backend runs on http://localhost:3000/api
- If MongoDB is not running on localhost:27017, the backend automatically falls back to an in-memory MongoDB instance (non-persistent data)

## Angular Project - Functional Guide

## 1. Application Purpose

The goal of the application is to help users compare renting vs buying and manage real-estate listings in one place.

## 2. User Roles

### Guest (Not Authenticated User)

- Can open Home page
- Can use the calculator page
- Can open About page
- Can view the listings catalog
- Can open Login and Registration pages

### Authenticated User

- Can create new listings
- Can edit only their own listings
- Can delete only their own listings
- Can view personal profile dashboard
- Can view their own listings in profile

## 3. Public Features

Features available without login:

- Home page
- Calculator page
- About page
- Listings catalog page
- Login page
- Registration page

Authenticated user features:

- Create listing
- Edit own listing
- Delete own listing
- View personal dashboard (Profile)
- View My Listings

## 4. Main Application Flow

1. User opens the Home page.
2. User navigates to Listings and explores available properties.
3. User can use the Calculator page to compare rent vs buy.
4. User registers or logs in.
5. Authenticated user creates a new listing.
6. The listing appears in the Listings catalog and in My Listings (Profile).
7. The owner can later edit or delete that listing.

## 5. Data Structure

Main collection object: Listing

- id
- title
- city
- type (Rent or Buy)
- price
- imageUrl
- bedrooms
- bathrooms
- areaSqm
- description
- ownerId
- ownerName
- createdAt

Auth user object:

- _id
- username
- email
- tel (optional)

## 6. Project Architecture

Angular frontend structure (rent-or-buy-houses/src/app):

- about/
- calculator/
- header/
- home/
- listing-editor/
- listings/
- login/
- profile/
- register/
- services/
- app.routes.ts
- auth.guard.ts
- listing-owner.guard.ts

Backend structure (Rest-api):

- config/
- controllers/
- models/
- router/
- utils/
- index.js

## 7. Technologies Used

- Angular
- TypeScript
- RxJS
- Node.js
- Express
- MongoDB
- Mongoose
- HTML/CSS
- REST API

Note: Firebase is not used in this stage.

## Useful Commands

Frontend (from rent-or-buy-houses):

```bash
npm run build
npm test
```

Backend (from Rest-api):

```bash
npm start
```
