import express from 'express'
const morgan = require('morgan') 

const app = express()
app.use(morgan('tiny'))

app.get('/',(req, res) => {

    res.send("Hello! HOOKLOOP!!!")
})

app.listen(8088, () => {
    console.log("Server is running!")
})