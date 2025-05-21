const mongoose = require('mongoose')


const connectDb=async()=>{

    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log(`'mongo database connected':${connect.connection.host}`)

    } catch (error) {
        console.log('the database connection error',error)
        process.exit(1);
    }
}
console.log(process.env.MONGO_URI+'this')

module.exports=connectDb