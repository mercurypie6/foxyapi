import { Error } from 'mongoose';
import { AskModel, IAsk } from "../models/Ask";
import { DialogModel } from "../models/Dialog";
import { IRide, RideModel } from "../models/Ride";
import { UserModel } from "../models/User";

export interface IConfirmAsk {
  state: {
    askItem: IAsk,
    rideItem: IRide,
    searchRidesParams?: null
  }
}

export interface ICancelConfirm {
  askItem: IAsk,
  confirmedOffer: IRide
}

type UserNotifyResult = {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
  upsertedId: any;
  upsertedCount: number;
};

export default class DbService {
 
  static getRegisteredSubs = (points: Array<string>): Promise<Array<IAsk>> => {
  
    return new Promise(async function (resolve, reject) {
      try {
        const subs = await AskModel.find({
          confirmed: false,
          $and: [
            {
              "localityFrom.localityName": {
                $in: points,
              },
            },
            {
              "destination.localityName": {
                $in: points,
              },
            },
          ],
        });
        resolve(subs);
      } catch (err){
        reject(err);
      }  
    });
  };

  
  static async findOffersByIdArray (offersIdArray: Array<string>): Promise<Array<IRide>> { 
   
      try {
        const ridesAsOffers: Array<IRide> = await RideModel.find({ _id: { $in: offersIdArray } }).exec();
        return ridesAsOffers;
      } catch (err) {
        throw err;
      }  
  };

  static findAsksByIdArray = (asksIdArray: Array<string>): Promise<Array<IAsk>> => {
 
    return new Promise(async function (resolve, reject) {
      try {
        const extractedAsks = await AskModel.find({ _id: { $in: asksIdArray } });
        resolve(extractedAsks);
      } catch (err){
        reject(err);
      }   
    });
  };

  static addOffersToMongo = (matched: Array<IAsk>, applicant: IRide) => {
  
    return new Promise(async function (resolve, reject) {
      try {
        const asksArray = matched.map((ask: any) => ask._id);
        const signed = AskModel.updateMany(
          { _id: { $in: asksArray } },
          {
            $push: {
              offers: applicant,
            },
          }
        );
        resolve(signed);
      } catch (err){
        reject(err);
      }   
    });
  };


  static addNotifyToUser = (usersToNotify: Array<string>, initiator: string, eventType: string): Promise<UserNotifyResult> => {
  
    return new Promise(async function (resolve, reject) {
      try {
        const signed = UserModel.updateMany(
          { _id: { $in: usersToNotify } },
          {
            $push: {
              notifications: {
                initiator,
                event: eventType,
              },
            },
          }
        );
        resolve(signed);
      } catch (err){
        reject(err instanceof Error ? err : new Error('Unknown error'));
      }      
    });
};

  static addAskToRide = (rideItemId: string, applicant: IAsk) => {

    return new Promise(async function (resolve, reject) {
      try {        
        const signed = RideModel.updateMany(
          { _id: rideItemId },
          {
            $push: {
              asks: applicant,
            },
          }
        );
        resolve(signed);
      } catch (err){
        reject(err);
      }      
    });
  };

  static confirmAskToRideMongo = (payload: IConfirmAsk) => {
 
    const { state } = payload;      
    const rideItemId = state.rideItem._id;
    const askItemId = state.askItem._id;

    return new Promise(async function (resolve, reject) {
      try {
        const signed = RideModel.updateMany(
          { _id: rideItemId },
          {
            $push: {
              passengers: state.askItem,
            },
            $pull: {
              asks: { _id: askItemId },
            },
          }
        );
        resolve(signed);
      } catch (err){
        reject(err);
      }    
    });
  };

  static modifyAskAfterConfirmMongo = (payload: IConfirmAsk) => {
  
    const { state } = payload;
    const askItemId = state.askItem._id;
    const rideItemId = state.rideItem._id;

    return new Promise(async function (resolve, reject) {
      try {
        const signed = AskModel.updateMany(
          { _id: askItemId },
          {
            confirmed: true,
            $push: {
              agreeded: state.rideItem,
            },
            $pull: {
              offers: { _id: rideItemId },
            },
          }
        );
        resolve(signed);
      } catch (err){
        reject(err);
      }
      
    });
  };

  static deleteConfirmationInRide = (payload: ICancelConfirm) => {
   
    const { confirmedOffer, askItem } = payload;
    const confirmedOfferId = confirmedOffer._id;
    const askItemId = askItem._id;
  
    return new Promise(async function (resolve, reject) {
      try {
        const signed = RideModel.updateMany(
          { _id: confirmedOfferId },
          {
            $pull: {
              passengers: { _id: askItemId },
            },
          }
        );
        resolve(signed);
      } catch (err){
        reject(err);
      }
      
    });
  };

  static deleteRide = (rideIdToDelete: string) => {

    return new Promise(async function (resolve, reject) {
      try {
        const signed = RideModel.deleteOne({ _id: rideIdToDelete });
        resolve(signed);
      } catch (err){
        reject(err);
      }     
    });
  };

  static modifyAskAfterDeleteRide = (payload: IRide) => {
 
    const passengersIdArray = payload.passengers.map((item: IAsk) => item._id); 

    return new Promise(async function (resolve, reject) {
      try {
        const signed = AskModel.updateMany(
          { _id: { $in: passengersIdArray } },
          {
            confirmed: false,
            $set: {
              agreeded: [],
            },
          },
          {}
        );
        resolve(signed);
      } catch (err){
        reject(err);
      }      
    });
  };

  static updateDialog = (author: string, content: string, referedAsk: string) => {

    return new Promise(async function (resolve, reject) {
      try {
        const signed = DialogModel.updateMany(
          { referedAsk: referedAsk },
          {
            $push: {
              body: {
                author: author,
                content: content,
              },
            },
          }
        );
        resolve(signed);
      } catch (err){
        reject(err);
      }      
    });
  };

  static modifyAskAfterUnconfirm = (payload: ICancelConfirm) => {
  
    const { confirmedOffer, askItem } = payload;
    const askItemId = askItem._id;
    const confirmedOfferId = confirmedOffer._id;

    return new Promise(async function (resolve, reject) {
      try {
        const signed = AskModel.updateMany(
          { _id: askItemId },
          {
            confirmed: false,
            $pull: {
              agreeded: { _id: confirmedOfferId },
            },
          }
        );
        resolve(signed);
      } catch (err){
        reject(err);
      }      
    });
  };
}


