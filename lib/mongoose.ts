import moongoose from 'mongoose';


let isConnected: boolean = false; //variable to check if the connection is established or not

export const connectToDatabase = async () => {
    moongoose.set('strictQuery', true);


    if (!process.env.MONGODB_URI) {
        return ('MONGODB_URI not found');
    }
    if(isConnected) {
        return ('already connected');
    }   
    try {
        await moongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('connected to database');

       
    } catch (error) {
      console.log('error connecting to database');  
        
    }

}