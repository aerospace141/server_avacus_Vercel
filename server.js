const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const signup = require('./Routes/user_auth/signup');
const login = require('./Routes/user_auth/login');
const index = require("./Routes/SetUp_State/index");
const verify = require('./Routes/user_auth/verify');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cors({ origin: 'http://localhost:3000' }));
mongoose.set('debug', true);

app.use('/api', signup);
app.use('/api', login);  
app.use('/api', index);  
app.use('/api', verify);  


mongoose.connect('mongodb+srv://ayush1777:agr11@cluster0.0128p.mongodb.net/abecus', { useNewUrlParser: true,  });
const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const port = 5000;
app.get("/",(req,res) => {
  res.status(200).send("hi,Its Abecuse, Its working.");
})
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
