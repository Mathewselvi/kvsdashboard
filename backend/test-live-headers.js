const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const run = async () => {
  try {
    const MONGO_URI = 'mongodb+srv://mathewselvi29_db_user:jLX4dXinPg9897c5@cluster0.agwudjy.mongodb.net/kvs_dashboard?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    
    // Find an admin to generate a token for
    const Admin = require('/Users/mathewselvi/Desktop/beyondheaven images/kvsdashboard/backend/models/Admin');
    const admin = await Admin.findOne();
    if (!admin) {
      console.error('No admin found in DB');
      process.exit(1);
    }
    
    const token = jwt.sign({ id: admin._id }, 'your_jwt_secret_key_here', { expiresIn: '1d' });
    console.log('Generated token:', token);
    
    const url = `http://localhost:5005/api/reports/export?type=monthly&business=resort&token=${token}`;
    console.log('Requesting URL:', url);
    
    const response = await fetch(url);
    console.log('Status:', response.status);
    console.log('Headers:');
    for (const [key, val] of response.headers.entries()) {
      console.log(`  ${key}: ${val}`);
    }
    
    const text = await response.text();
    console.log('Response body preview (first 100 chars):', text.substring(0, 100));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
