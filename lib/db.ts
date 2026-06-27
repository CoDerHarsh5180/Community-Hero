import mongoose from "mongoose";

type ConnectionObject = {
    isConnected? : number
}

const connection: ConnectionObject = {}  //connection varible is created, whose datatype is ConnectionObject and initially it is Empty(As its datatype is optional)

async function connectDB(): Promise<void> {             //Here void means that, It can return any datatype
    if(connection.isConnected){
        console.log("Alredy Connected to db")
        return
    }
    else{
        try{
            const db = await mongoose.connect(process.env.MONGODB_URI || '', {})

            connection.isConnected = db.connections[0].readyState

            console.log("DB Connected Successfully")
        }
        catch(e){
            console.log("Database connection Failed", e)
            process.exit(1)
        }
    }    
}

export {connectDB}