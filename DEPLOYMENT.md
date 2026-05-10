# 🚀 Deployment Guide — Farewell 2024–26

## Free mein deploy karne ke options:

| Part | Platform | Free Plan |
|---|---|---|
| Frontend (Next.js) | Vercel | ✅ Forever free |
| Backend (Node.js) | Render | ✅ Free (sleeps after 15min) |
| Database | MongoDB Atlas | ✅ 512MB free |
| Images/Videos | Cloudinary | ✅ 25GB free |

---

## STEP 1 — MongoDB Atlas Setup

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) pe jaao
2. **Try Free** → Account banao → Free cluster choose karo (M0)
3. **Username & Password** set karo (yaad rakhna!)
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
5. **Connect** → **Drivers** → Connection string copy karo:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/farewell2426
   ```

---

## STEP 2 — Cloudinary Setup

1. [cloudinary.com](https://cloudinary.com) → Free account banao
2. Dashboard pe yeh teen cheezein copy karo:
   - **Cloud Name** (jaise: `dxxx123`)
   - **API Key** (numbers)
   - **API Secret** (long string)

---

## STEP 3 — Gmail App Password (Emails ke liye)

1. Gmail account kholo
2. [myaccount.google.com/security](https://myaccount.google.com/security)
3. **2-Step Verification** → ON karo
4. **App passwords** → Select app: **Mail** → Generate
5. 16-digit password milega → copy karo

---

## STEP 4 — Backend Deploy on Render

1. [render.com](https://render.com) → GitHub se sign up karo

2. Pehle GitHub pe project push karo:
   ```bash
   # Ek baar karo
   git init
   git add .
   git commit -m "initial commit"
   
   # GitHub pe naya repo banao, phir:
   git remote add origin https://github.com/TUMHARA_USERNAME/farewell-2024-26.git
   git push -u origin main
   ```

3. Render pe:
   - **New** → **Web Service**
   - GitHub repo connect karo
   - Settings:
     ```
     Name: farewell-backend
     Root Directory: backend
     Runtime: Node
     Build Command: npm install
     Start Command: node src/server.js
     ```

4. **Environment Variables** add karo (Render dashboard mein):
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/farewell2426
   JWT_ACCESS_SECRET=koi_bhi_lamba_64_char_string_likho
   JWT_REFRESH_SECRET=aur_ek_alag_64_char_string_likho
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=tumhari@gmail.com
   EMAIL_PASS=16_digit_app_password
   CLIENT_URL=https://TUMHARA-FRONTEND.vercel.app
   CLOUDINARY_CLOUD_NAME=tumhara_cloud_name
   CLOUDINARY_API_KEY=tumhari_api_key
   CLOUDINARY_API_SECRET=tumhara_api_secret
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=tumhara_secret
   ```

5. **Deploy** → URL milega jaise: `https://farewell-backend.onrender.com`

---

## STEP 5 — Frontend Deploy on Vercel

1. [vercel.com](https://vercel.com) → GitHub se sign up karo

2. **New Project** → Same GitHub repo import karo

3. Settings:
   ```
   Framework: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   ```

4. **Environment Variables** add karo:
   ```
   NEXT_PUBLIC_API_URL=https://farewell-backend.onrender.com/api
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
   ```

5. **Deploy** → URL milega jaise: `https://farewell-2024-26.vercel.app`

6. Ab Render pe jaao aur `CLIENT_URL` update karo Vercel URL se

---

## STEP 6 — Admin banao (Production mein)

Production mein signup karo, phir MongoDB Atlas mein:

1. Atlas → Browse Collections → `users` collection
2. Tumhara document dhundo
3. Edit karo:
   ```json
   "role": "admin",
   "isApproved": true,
   "isEmailVerified": true
   ```

---

## STEP 7 — Custom Domain (Optional, Free)

**Freenom** pe free domain milta hai (.tk, .ml, .ga):
1. [freenom.com](https://freenom.com) pe register karo
2. Vercel pe: Settings → Domains → Custom Domain add karo
3. Freenom mein DNS records update karo jo Vercel bataye

---

## ⚠️ Important Notes

### Render Free Plan:
- Server 15 minute inactivity ke baad **sleep** ho jata hai
- Pehli request slow hogi (~30 sec) — baki fast hogi
- Upgrade karo ($7/month) agar 24/7 chahiye

### Video Upload:
- Cloudinary free mein **25GB** storage + **25GB** bandwidth/month
- Bade videos ke liye paid plan lena padega

### CORS Error aaye toh:
Render mein `CLIENT_URL` check karo — exact Vercel URL honi chahiye (trailing slash mat lagao)

---

## Local Development (Ghar pe chalana)

```bash
# Terminal 1 — Backend
cd backend
npm install
node src/server.js  # ya npm run dev

# Terminal 2 — Frontend  
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000/api/health
