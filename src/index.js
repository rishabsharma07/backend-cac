// // require('dotenv').config({path: "./env"})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    // app.on(error,()=>{
    //     console.log(`ERROR: ${error}`);
    //     // throw error
        
    // })
    app.listen(process.env.PORT ||  8000,()=>{
        console.log(`Server running at port ${process.env.PORT}`);
    })
})

.catch((error)=>{
    console.log("Mongo db connection failed: ", error);
    
})




// /*
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

// ( async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     }
//     catch(error){
//         console.log("error: ",error);
//         throw error
        
//     }

// })()    

// */








