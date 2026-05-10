require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const ADMIN_EMAIL = 'your@email.com'; // ← YAHAN APNA EMAIL DAALO

async function main() {
  try {
    console.log('MongoDB se connect ho raha hai...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const user = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      { $set: { role: 'admin', isApproved: true, isEmailVerified: true } },
      { new: true }
    );

    if (user) {
      console.log('✅ Done! ' + user.name + ' (' + user.email + ') ab admin hai!');
    } else {
      console.log('❌ User nahi mila. Pehle signup karo phir ye script chalao.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
