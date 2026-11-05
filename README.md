# Prestige Motors — Car showroom web app

A luxury car dealership website: a cinematic home page, a car marketplace with filters, car detail pages with inquiries and test-drive booking, customer accounts, and an admin dashboard for inventory, customers, inquiries and sales.

## Features

**Showroom (public and customers)**
- Home: full-width hero (video or fallback photo), "Explore Cars" and "Sell Your Car" buttons, featured cars, categories, new arrivals, recently added and most viewed
- Browse cars: All, New, Used, Featured, Recently added and Popular views; filters for brand, model, price range, model year, mileage, transmission, fuel type, body type, condition and category; sorting and pagination
- Car details: photo gallery, description, specifications (year, mileage, engine, transmission, fuel, colours, VIN, condition, location, category), similar cars
- Contact seller, request information (both send an inquiry), schedule a test drive, and add to wishlist
- Accounts: register, log in, forgot and reset password, profile and password change, my inquiries (with replies), my test drive requests, my wishlist, recently viewed, logout

**Admin dashboard (`/admin`)**
- Overview: total, available and sold cars, customers, inquiries, revenue from sold cars, recent activities, new inquiries and pending test drives
- Cars: add, edit, delete; upload multiple photos; update prices and specifications; set featured; manage availability; mark as sold with a final sale price
- Categories: add, edit (with image), delete (refused while cars still use it)
- Inquiries: filter by status, read, reply (replies appear in the customer's account), update status
- Test drives: confirm, complete or cancel requests
- Customers: list, details, inquiry and test-drive history, enable or disable accounts
- Inventory: availability and price overview with quick edits
- Sales reports: revenue by month and by brand, average sale, stock value
- Showroom settings and admin profile; notifications bell in the top bar

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, Axios, Lucide React |
| Backend | Node.js, Express 4, Mongoose, JWT, bcryptjs, Multer |
| Database | MongoDB |

## Setup

You need Node.js 18+ and MongoDB running locally (default `mongodb://127.0.0.1:27017`) or an Atlas connection string.

**1. API**

```bash
cd server
npm install
cp .env.example .env        # set JWT_SECRET and ADMIN_PASSWORD
npm run seed                # categories, 16 sample cars, showroom settings, admin account
npm run dev                 # API on http://localhost:5000
```

**2. Website (development)**

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

- Website: http://localhost:5173
- Admin: http://localhost:5173/admin/login (seeded login: `admin@showroom.com` / `Admin123!` unless changed in `.env`)

**Production:** run `npm run build` in `client`, then `npm start` in `server`. The API serves the built site.

## Things to know

- **Hero video:** set `VITE_HERO_VIDEO_URL` in `client/.env` to an MP4 you have the rights to use (for example `VITE_HERO_VIDEO_URL=https://your-cdn.example/showroom.mp4`). Without it, the hero shows the fallback photo. The video also falls back to the photo if it fails to load.
- **Photos:** the seed uses Unsplash photos linked by URL. Their names in the seed were matched by eye, so check each car and replace photos or names as needed. Admins can upload their own photos per car.
- **Sample data:** the seed includes two cars under a placeholder make, "Demo EV". Replace them with real stock.
- **Email is not sent.** Password-reset links print to the server console. Contact and Sell pages open the visitor's email app with the message filled in.
- **Trucks:** the seed has no cars in the "Trucks" category. Add one from the admin dashboard, or change the seed.
- **Sessions:** the JWT is kept in `localStorage`. Add login rate limiting and HTTPS before going live. Uploads are stored on local disk.

## Layout

```
server/
  src/server.js            Express app and routes
  src/models/              User, Car, Category, Inquiry (inquiries and test drives), Settings, ActivityLog
  src/routes/              auth, cars (public marketplace), me (customer), categories, settings, admin
  src/middleware/          JWT auth, admin guard, photo upload
  src/utils/seed.js        Sample data (npm run seed)
client/
  src/App.jsx              Routes (showroom, customer account, admin)
  src/components/          Navbar, footer, hero, car card, status badge
  src/pages/store/         Home, Browse, CarDetail, Categories, Sell, Wishlist, About, Contact, account pages
  src/pages/admin/         Dashboard, Cars, CarForm, Categories, Inquiries, TestDrives, Customers, Inventory, Reports, settings
```
