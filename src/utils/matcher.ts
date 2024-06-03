import { IAsk } from "../models/Ask";
import { IRide } from "../models/Ride";

function findMatchingSubs(route: Array<string>, subscriptions: Array<IAsk>): Array<IAsk> {
  const subroutesSet = prepareSubroutesSet(route);

  return subscriptions.filter((s) =>
    subroutesSet.has(
      makeKey(s.localityFrom.localityName, s.destination.localityName)
    )
  );
}

function prepareSubroutesSet(route: Array<string>) {
  const subroutesSet = new Set();

  for (let fromIdx = 0; fromIdx < route.length; fromIdx++) {
    for (let dstIdx = fromIdx + 1; dstIdx < route.length; dstIdx++) {
      subroutesSet.add(makeKey(route[fromIdx], route[dstIdx]));
    }
  }  
  return subroutesSet;
}

function makeKey(from: string, dst: string) {
  return `${from}:${dst}`;
}

function findMatchingRides(searchedRides: Array<IRide>, localityFrom: string, destination: string): Array<IRide> {
  const preparedRides: Array<IRide> = [];

  const modifiedRides = searchedRides.forEach((ride) => {
    let points = ride.points;
  
    let route: Array<string> = points.map((item) => item.localityName);

    const subroutesSet = prepareSubroutesSet(route);
    
    function findMatched(route: Array<string>) {
    
      if (subroutesSet.has(`${localityFrom}:${destination}`)) {
        preparedRides.push(ride);
      } else {
        console.log("not matched!");
      }
    };
    findMatched(route)
  
  });
  return preparedRides;
}

export {
  findMatchingSubs as getMatchedData,
  findMatchingRides
};
