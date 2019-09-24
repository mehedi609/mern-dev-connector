const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies,node/no-unpublished-require
const morgan = require('morgan');

const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('App is running');
});

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}...`));
