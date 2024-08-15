const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./utils/db');
require('dotenv').config(); // Load environment variables

const app = express();

app.use(bodyParser.json());

connectDB();
app.get('/api', (req,res)=>{
    res.send('hello');
})
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expense'));
app.use('/api/wallets', require('./routes/wallet'));
app.use('/api/categories', require('./routes/category'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
