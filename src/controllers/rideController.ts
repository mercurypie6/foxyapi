import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/User";
import { RoleModel } from "../models/Role";
import { IRide, RideModel } from "../models/Ride";
import { AskModel, IAsk } from "../models/Ask";
import { DialogModel, IDialog } from "../models/Dialog";
import { ILocality, LocalityModel } from "../models/Locality";
import dbService, { ICancelConfirm, IConfirmAsk } from "../db/dbQuery.ts";
import { findMatchingRides } from "../utils/matcher.ts";
import { getGraphData } from "../db/neo4j.ts";
import EventType from "../utils/constants";
import { check, validationResult } from "express-validator";
import { errorSerializer } from "../errors/errorSerializer";
import { INotification } from "../models/Notification";

export type RequestWithBody<T> = Request< {}, {}, T>
export type RequestWithQuery<T> = Request< {}, {}, {}, T>
export type RequestWithParams<T> = Request<T>
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>

class RideController {

  async createlocality(req: RequestWithBody<{ locality: string, clarification: string }>, res: Response, next: NextFunction) {

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Uncorrect request",
        });
      }
      const { locality, clarification } = req.body;
      const candidate = await LocalityModel.findOne({ locality });
      if (candidate) {
        return res
          .status(400)
          .json({ message: `Locality ${locality} is already exists` });
      }
      const point = new LocalityModel({ locality, clarification });
      await point.save();
      return res.status(201).json({ message: "Locality was added" });
    } catch (e) {    
      next(e);
    }
  }

  async createride(req: RequestWithBody<{ localityFrom: ILocality, destination: ILocality, date: Date, user: string }>, res: Response, next: NextFunction) {

    try {
      const { localityFrom, destination, date, user } = req.body;    
      const { cities, direction } = await getGraphData(
        localityFrom.id,
        destination.id
      );      
      const points = cities;
      const ride = new RideModel({
        localityFrom,
        destination,
        points,
        direction,
        date,
        user,
      });
      await ride.save();
      return res.status(201).json("new ride created");
    } catch (e) {    
      next(e);
    }
  }
 
  async deleteRide(req: RequestWithBody<{payload: IRide}>, res: Response, next: NextFunction) {

    try {
      const { payload } = req.body;
      const rideIdToDelete = payload._id;
      await dbService.deleteRide(rideIdToDelete);
      await dbService.modifyAskAfterDeleteRide(payload);
      return res.status(200).json("ride deleted");
    } catch (e) {
      next(e);
    }
  }

  async createAsk(req: RequestWithBody<{ localityFrom: ILocality, destination: ILocality, date: Date, user: string }>, res: Response<{ message: string, status: string, result: IAsk}>, next: NextFunction) {

    try {
      const { localityFrom, destination, date, user } = req.body;    
      const { cities, direction } = await getGraphData(localityFrom.id, destination.id);     
      const points = cities;
      const ask = new AskModel({
        localityFrom,
        destination,
        points,
        direction,
        date,
        user,
      });
      const result = await ask.save();      
      return res
        .status(201)
        .json({ message: "new ask created", status: "OK", result });
    } catch (e) {
      next(e);
    }
  }

  async addAskToRide(req: RequestWithBody<{ rideItem: IRide, applicant: IAsk }>, res: Response, next: NextFunction) {

    try {
      const { rideItem, applicant } = req.body;
      const rideItemId = rideItem._id;
      const result = await dbService.addAskToRide(rideItemId, applicant);
      let usersToNotify: Array<string> = [];
      usersToNotify.push(rideItem.user);
      const eventType: string = EventType.ASK;
      let initiator: string = applicant._id;
      await dbService.addNotifyToUser(usersToNotify, initiator, eventType);
      return res
        .status(200)
        .json({ message: "ask added to ride", status: "OK", data: result });
    } catch (e) {      
      next(e);
    }
  }

  async fetchDialog(req: RequestWithBody<{ author: string, content: string, participants: Array<string>, referedAsk: string }>, res: Response<{status: string, message: string, data: IDialog}>, next: NextFunction) {  
                
    try {
      const { author, content, participants, referedAsk } = req.body;     
      const result = await DialogModel.findOne({ referedAsk: referedAsk });      
      if (!result) {
        const dialog = new DialogModel({
          participants,
          referedAsk,
          body: [
            {
              author: author,
              content: content,
            },
          ],
        });
        await dialog.save();
        res.status(201).json({
          status: "OK",
          message: "new dialog created",
          data: dialog,
        });
      } else {
        res.status(200).json({
          status: "OK",
          message: "dialog found in database",
          data: result,
        });
      }
    } catch (e) {
      next(e);
    }
  }

  async updateDialog(req: RequestWithBody<{ author: string, content: string, referedAsk: string }>, res: Response, next: NextFunction) {
    
    try {
      const { author, content, referedAsk } = req.body; 
      const updateResult = await dbService.updateDialog(
        author,
        content,
        referedAsk
      );
      console.log("updateResult:", updateResult);
      return res.status(200).json({ message: "dialog updated", status: "OK" });
    } catch (e) {
      next(e);
    }
  }

  async findMyAsk(req: RequestWithParams<{ id: string }>, res: Response<Array<IAsk>>, next: NextFunction) {

    try {
      const { id } = req.params;
      const asks = await AskModel.find({ user: id });
      return res.status(200).json(asks);
    } catch (e) {
      next(e);
    }
  }

  async confirmAsk(req: RequestWithBody<{ payload: IConfirmAsk }>, res: Response, next: NextFunction) { 

    try {
      const { payload } = req.body;      
      await dbService.confirmAskToRideMongo(payload);
      await dbService.modifyAskAfterConfirmMongo(payload);
      let usersToNotify: Array<string> = [];
      usersToNotify.push(payload.state.askItem.user);
      const eventType: string = EventType.CONFIRM;
      let initiator: string = payload.state.rideItem._id;
      await dbService.addNotifyToUser(usersToNotify, initiator, eventType);
      return res.status(200).json("ask confirmed");
    } catch (e) {
      next(e);
    }
  }

  async unconfirmAsk(req: RequestWithBody<{ payload: ICancelConfirm }>, res: Response, next: NextFunction) {

    try {
      const { payload } = req.body;      
      await dbService.deleteConfirmationInRide(payload);
      await dbService.modifyAskAfterUnconfirm(payload);      
      return res.status(200).json("confirmation rejected");
    } catch (e) {
      next(e);
    }
  }

  async findAskById(req: RequestWithParams<{ id: string }>, res: Response<IAsk | { message: string }>, next: NextFunction) {

    const { id } = req.params;    
    try {
      const ask = await AskModel.findOne({ _id: id });
      if (!ask) {
        return res.status(404).json({ message: 'Ask not found' });
    }
      return res.status(200).json(ask);
    } catch (e) {
      next(e);
    }
  }

  async findAsks(req: RequestWithBody<{ payload: Array<string> }>, res: Response<{result: Array<IAsk>}>, next: NextFunction) {

    try {
      const { payload } = req.body;      
      const result = await dbService.findAsksByIdArray(payload);      
      return res.status(200).json({result});
    } catch (e) {
      next(e);
    }
  }

  async findMyRides(req: RequestWithParams<{ id: string }>, res: Response<{myRides: Array<IRide>}>, next: NextFunction) {
    
    const { id } = req.params;
    try {      
      const myRides: Array<IRide> = await RideModel.find({ user: id });
      return res.status(200).json({myRides});
    } catch (e) {
      next(e);
    }
  }

  async findNotifications(req: RequestWithParams<{ id: string }>, res: Response<{notifications: Array<INotification>} | {message: string}>, next: NextFunction) {

    const { id } = req.params;    
    try {
      const notifications: Array<INotification> | null = await UserModel.findOne(
        { _id: id },
        { notifications: 1 }
      );   
      if (notifications) { 
        return res.status(200).json({notifications});
      } else {
        return res.status(200).json({ message: "notifications not found"});
      }      
    } catch (e) {
      next(e);
    }
  }

  async findRideById(req: RequestWithParams<{ id: string }>, res: Response<{ride: IRide} | { message: "ride not found"}>, next: NextFunction) {

    const { id } = req.params;
    try {
      const ride: IRide | null = await RideModel.findOne({ _id: id });      
      if(ride) { 
        return res.status(200).json({ride});
      } else {
        return res.status(200).json({ message: "ride not found"});
      }       
    } catch (e) {
      next(e);
    }
  }

  async findOffers(req: RequestWithBody<{ payload: Array<string>}>, res: Response<Array<IRide>>, next: NextFunction) {

    try {
      const { payload } = req.body;     
      const result = await dbService.findOffersByIdArray(payload);      
      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  async findLocs(req: Request, res: Response<Array<ILocality>>, next: NextFunction) {

    try {
      const locs = await LocalityModel.find().sort({ locality: 1 });
      return res.status(200).json(locs);
    } catch (e) {
      next(e);
    }
  }

  async findLocality(req: RequestWithQuery<{ search: string}>, res: Response<{ searchResult: Array<ILocality> } | { message: string } | []>, next: NextFunction) {

    try {           
      const { search } = req.query;      
      if (search) {
        let searchResult: Array<ILocality> | [];
        searchResult = await LocalityModel.find({ locality: { $regex: new RegExp("^" + search + ".*", "i") }}).exec();
        if (searchResult.length > 0) {
          searchResult.slice(0, 10);
          return res.status(200).json({searchResult});
        } else {
          return res.status(200).json([]);
        }
      } else {
        return res.status(400).json({ message: "bad request params" });
      }       
    } catch (e) {
      next(e);
    }
  }  

  async findRidesBySearchParams(req: RequestWithQuery<{ date: Date, localityFrom: string, destination: string }>, res: Response<{ matchedRides: Array<IRide> } | []>, next: NextFunction) {

    try {      
      const { date, localityFrom, destination } = req.query;
      const search = await RideModel.find({
        $and: [
          { "points.localityName": localityFrom },
          { "points.localityName": destination },
          { date: date },
        ],
      });     
      const matchedRides: Array<IRide> | [] = findMatchingRides(search, localityFrom, destination);  
      return res.status(200).json({ matchedRides });
    } catch (e) {
      next(e);
    }
  }
}

const rideController = new RideController();
export { rideController };
