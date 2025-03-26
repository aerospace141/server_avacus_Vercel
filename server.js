const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const signup = require('./Routes/user_auth/signup');
const login = require('./Routes/user_auth/login');
const index = require("./Routes/SetUp_State/index");
const verify = require('./Routes/user_auth/verify');

const port = process.env.PORT || 3000;


app.use(bodyParser.json());
// app.use(cors());
app.use(cors({ origin: 'https://avacus.vercel.app' }));
// mongoose.set('debug', true);

app.use('/api', signup);
app.use('/api', login);  
app.use('/api', index);  
app.use('/api', verify);  


const mongoURI = process.env.MONGODB_URI || "mongodb+srv://ayush1777:agr11@cluster0.0128p.mongodb.net/abecus";

mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB using Mongoose 8.2.1'))
  .catch((err) => console.error('Connection error:', err));
  
  const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());

app.get("/",(req,res) => {
  res.status(200).send("hi,Its Abecuse, Its working.");
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
