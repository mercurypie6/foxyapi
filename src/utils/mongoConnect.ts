import mongoose, { Error } from "mongoose";
require("dotenv").config();
import { dbListener } from "./mongoListener";
import { ChangeStream } from "mongodb";
import { IRide, RideModel } from "../models/Ride";

const DB_URL = process.env.DB_URL;


const mongooseParams = {  
  socketTimeoutMS: 10000
}

const mongoConnect = async () => {
  try {
    mongoose.connect(DB_URL as string, mongooseParams);
    const db = mongoose.connection;  
    let pipeline: ChangeStream<IRide>
    db.on("error", (error: Error) => {
      console.error(error.message);
      if (pipeline) {
        pipeline.close();
      }  
      mongoose.disconnect();
    }); 
    db.on("connected", () => {
      console.log("#connected: connected to db");
      pipeline = RideModel.watch();
      dbListener.init(pipeline);
    });
    db.on("open", () => {
      console.log("#open: connected to db");
    });
    db.on("disconnected", () => {
      console.log("db disconnected");
      if (pipeline) {
        pipeline.close();
      }      
    });
    db.on("close", () => {
      console.log("#close: mongoose disconnected");
      if (pipeline) {
        pipeline.close();
      }  
    });
  } catch (error: any) {
      console.error(error.message);
  }
};

export { mongoConnect }