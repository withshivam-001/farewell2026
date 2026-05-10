# 🎬 Farewell 2024–26

Premium cinematic farewell website — Glitch intro, video hero, social wall, admin dashboard, Razorpay payments.

---

## ⚡ Setup (Windows)

### Step 1 — Backend .env banao
`backend` folder mein `.env` file banao:
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/farewell2426
JWT_ACCESS_SECRET=koi_bhi_64_char_random_string
JWT_REFRESH_SECRET=aur_ek_alag_64_char_string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tumhari@gmail.com
EMAIL_PASS=gmail_app_password_16_digit
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=cloudname
CLOUDINARY_API_KEY=apikey
CLOUDINARY_API_SECRET=apisecret
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=secret
NODE_ENV=development
```

### Step 2 — Frontend .env.local banao
`frontend` folder mein `.env.local` file banao:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

### Step 3 — Install & Run

Terminal 1 (Backend):
```bash
cd backend
npm install
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

### Step 4 — Admin banao
1. `http://localhost:3000/auth/signup` pe signup karo
2. `backend/makeAdmin.js` mein apna email daalo
3. Run karo: `node makeAdmin.js`
4. Login karo → Admin dashboard milega `/admin`

---

## 📁 Structure

```
farewell-2024-26/
├── backend/
│   ├── makeAdmin.js          ← Admin script
│   ├── .env                  ← Banani hai tumhe
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── config/
│       └── utils/
└── frontend/
    ├── .env.local            ← Banani hai tumhe
    └── app/
        ├── page.jsx          ← Main (Glitch → Video → Home)
        ├── wall/
        ├── videos/
        ├── memories/
        ├── groups/
        ├── batch/
        ├── admin/
        └── auth/
```

---

## 🔗 Required Accounts (Free)

| Service | Link | Kaam |
|---|---|---|
| MongoDB Atlas | mongodb.com/atlas | Database |
| Cloudinary | cloudinary.com | Images/Videos |
| Gmail App Password | myaccount.google.com | Emails |
| Razorpay (optional) | razorpay.com | Payments |
