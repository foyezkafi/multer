require("dotenv").config();
const express = require('express')
const app = express()
const dbConnection = require('./configuration/dbConnection.js')
const routes = require("./routes")
var cors = require('cors');
const PORT = process.env.PORT || 8000
const dns = require("node:dns")


dns.setServers(["8.8.8.8"], ["1.1.1.1"])

app.use(cors())
dbConnection()
app.use(express.json())
app.use(routes);
app.use('/uploads', express.static('uploads'));



app.get('/', function (req, res) {
  res.send('Todo Application')
})

app.listen(PORT, ()=>{
  console.log(`server is running on  http://localhost${PORT}`)
})