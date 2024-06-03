import { ChangeStream, ChangeStreamDocument } from "mongodb";
import { IRide } from "../models/Ride";
import { notifier } from "./Notifier";
import { getMatchedData } from "./matcher";
import  DbService  from "../db/dbQuery";
import { sse } from "../utils/sse";
import EventTypes from "../utils/constants";
import { IAsk } from "../models/Ask";

class DBListener {

  init(pipeline: ChangeStream<IRide>) {
    console.log("DBListener init...");  
    pipeline.on("change", async function (next: ChangeStreamDocument<IRide>) {   
      
      if (next.operationType === "insert") {
      
        let points = next.fullDocument.points;
        let route: Array<string> = points.map((item) => item.localityName);       
        let subs = await DbService.getRegisteredSubs(route);        
        let matched: Array<IAsk> | null;
        if ( subs && subs.length > 0 ) {
          matched = getMatchedData(route, subs);
          if ( matched && matched.length > 0) {
            let affordableRide: IRide = next.fullDocument;
            await DbService.addOffersToMongo(matched, affordableRide);
            let usersToNotify: Array<string> = matched.map((el: IAsk) => JSON.stringify(el.user).slice(1, -1));
            let eventType: string = EventTypes.OPPORTUNE; 
            let initiator: string = JSON.stringify(next.fullDocument._id).slice(1, -1);
            let addNotifyToUserResult = await DbService.addNotifyToUser(usersToNotify, initiator, eventType);      
            if ('acknowledged' in addNotifyToUserResult && addNotifyToUserResult.acknowledged === true) {
              const _notif = notifier.createNotification(usersToNotify, initiator, eventType);              
              sse._emitEvent(_notif);     
            }              
          }          
        }
      } else return;
    });
  }
}

export const dbListener = new DBListener();
