const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://ajaybmihub:ajay2004@cluster7.sid1ior.mongodb.net/goverment_qb");
  const doc = await mongoose.connection.db.collection('upsc').findOne({});
  console.log('Sample UPSC doc:', JSON.stringify(doc, null, 2));
  process.exit(0);
}
check();
