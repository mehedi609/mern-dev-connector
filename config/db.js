/*const dotenv = require('dotenv');
dotenv.config({ path: './../config.env' });*/
const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI').replace('<password>', config.get('db_pass'));

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('MongoDB Connected');
  } catch (e) {
    console.error(e.msg);
    process.exit(1);
  }
};

module.exports = connectDB;
