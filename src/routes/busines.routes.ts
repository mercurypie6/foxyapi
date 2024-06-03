import Router from "express";
import { sse } from "./../utils/sse.js";
import { check } from "express-validator";
import { rideController } from "../controllers/rideController.ts"

const router = Router();

router.post(
  "/createlocality",
  [
    check("locality", "locality field should not be empty").notEmpty(),
    check(
      "clarification",
      "clarification must be longer than 5 and shorter than 42"
    ).isLength({
      min: 5,
      max: 42,
    }),
  ],
  rideController.createlocality
);

router.post("/createride", rideController.createride);

router.post("/delete-ride", rideController.deleteRide);

router.post("/createask", rideController.createAsk);

router.post("/addasktoride", rideController.addAskToRide);

router.post("/fetch-dialog", rideController.fetchDialog);

router.post("/update-dialog", rideController.updateDialog);

router.get("/findmyask/:id", rideController.findMyAsk);

router.post("/confirm-ask", rideController.confirmAsk);

router.post("/unconfirm-ask", rideController.unconfirmAsk);

router.get("/findaskbyid/:id", rideController.findAskById);

router.post("/findasks", rideController.findAsks);

router.get("/find-notifications/:id", rideController.findNotifications);

router.get("/findmyrides/:id", rideController.findMyRides);

router.get("/findridebyid/:id", rideController.findRideById);

router.post("/findoffers", rideController.findOffers);

router.get("/findlocs", rideController.findLocs);

router.get(
  "/find-rides-by-search-params",
  rideController.findRidesBySearchParams
);

router.get("/findlocality", rideController.findLocality);

export { router };
