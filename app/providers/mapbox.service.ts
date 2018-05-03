import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

class TravelPoints {
  start: { 
    lat;
    lng;
  }
  finish: { 
    lat; 
    lng;
  }
}

class RouteObject {
  distance: number; // Float indicating the distance traveled in meters
  duration: number; // Float indicating the estimated travel time in seconds
  weight: number; // Float indicating the weight in units described by weight_name
  weight_name: string; // String indicating which weight was used. The default is routability which is duration based, with additional penalties for less desirable maneuvers.
  // geometry: Depending on the geometries parameter this is a GeoJSON LineString or a Polyline string. Depending on the overview parameter this is the complete route geometry (full), a simplified geometry to the zoom level at which the route can be displayed in full (simplified), or is not included (false).
  legs: RouteLeg[]; // Array of RouteLeg objects
}

class RouteLeg {
  distance: number; // Number indicating the distance traveled in meters
  duration: number; // Number indicating the estimated travel time in seconds
  steps: RouteStep[] // Depending on the steps parameter, either an Array of RouteStep objects (true, default) or an empty array (false)
  // steps: Depending on the steps parameter, either an Array of RouteStep objects (true, default) or an empty array (false)
  // summary: Depending on the summary parameter, either a String summarizing the route (true, default) or an empty String (false)
  // annotation: An annotations object that contains additional details about each line segment along the route geometry. Each entry in an annotations field corresponds to a coordinate along the route geometry.
}

class RouteStep {
  // distance: number; //Number indicating the distance traveled in meters from the maneuver to the next RouteStep.
  // duration: number; // Number indicating the estimated time traveled time in seconds from the maneuver to the next RouteStep.
  // geometry: Depending on the geometries parameter this is a GeoJSON LineString or a Polyline string representing the full route geometry from this RouteStep to the next RouteStep
  // name: String with the name of the way along which the travel proceeds
  // ref: Any road designations associated with the road or path leading from this step’s maneuver to the next step’s maneuver. Optionally included, if data is available. If multiple road designations are associated with the road, they are separated by semicolons. A road designation typically consists of an alphabetic network code (identifying the road type or numbering system), a space or hyphen, and a route number. You should not assume that the network code is globally unique: for example, a network code of “NH” may appear on a “National Highway” or “New Hampshire”. Moreover, a route number may not even uniquely identify a road within a given network.
  // destinations: String with the destinations of the way along which the travel proceeds. Optionally included, if data is available.
  // exits: String with the exit numbers or names of the way. Optionally included, if data is available.
  /// driving_side: The legal driving side at the location for this step. Either left or right.
  // mode: String indicating the mode of transportation. Possible values:
        /* For mapbox/driving: driving, ferry, unaccessible
        For mapbox/walking: walking, ferry, unaccessible
        For mapbox/cycling: cycling, walking, ferry, train, unaccessible */
  // maneuver: One StepManeuver object
  // pronunciation: A string containing an IPA phonetic transcription indicating how to pronounce the name in the name property. This property is omitted if pronunciation data is unavailable for the step.
  intersections: Intersection[]
}

class Intersection {
  location: string[]; // A [longitude, latitude] pair describing the location of the turn.
  // bearings: A list of bearing values (for example [0,90,180,270]) that are available at the intersection. The bearings describe all available roads at the intersection.
  // classes: An array of strings signifying the classes of the road exiting the intersection. Possible values:

  // toll: the road continues on a toll road
  // ferry: the road continues on a ferry
  // restricted: the road continues on with access restrictions
  // motorway: the road continues on a motorway
  // tunnel: the road continues in a tunnel
  // entry: A list of entry flags, corresponding in a 1:1 relationship to the bearings. A value of true indicates that the respective road could be entered on a valid route. false indicates that the turn onto the respective road would violate a restriction.
  // in: Index into bearings/entry array. Used to calculate the bearing before the turn. Namely, the clockwise angle from true north to the direction of travel before the maneuver/passing the intersection. To get the bearing in the direction of driving, the bearing has to be rotated by a value of 180. The value is not supplied for departure maneuvers.
  // out: Index into the bearings/entry array. Used to extract the bearing after the turn. Namely, The clockwise angle from true north to the direction of travel after the maneuver/passing the intersection. The value is not supplied for arrive maneuvers.
  // lanes: Array of Lane objects that represent the available turn lanes at the intersection. If no lane information is available for an intersection, the lanes property will not be present.
}

class Routes {
  routes: RouteObject[];
}

@Injectable()
export class MapboxService {

  private _api = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
  private _token = 'pk.eyJ1IjoibmFjaG8xMjM0MzI0MjM0IiwiYSI6ImNqZDNqN25kYTExemwycXFqbmRmdTNsc2QifQ.CInjKy5qEWs39L-gy_Aepg';

  constructor(
    private _http: HttpClient
  ) { }

  getDirections( travelPoints: TravelPoints ) {
    const points = [];

    return this._http
      .get( this._api + this._getStartAndFinish(travelPoints) + '?steps=true&access_token=' + this._token)
      .map( (data: Routes ) => {

        data.routes[0].legs[0].steps.forEach( (step: RouteStep) => {
          step.intersections.forEach( (intersection: Intersection) => {
            points.push({
              lat: intersection.location[1],
              lng: intersection.location[0]
            });    
          });
        });

        return points;
      });
  }

  getDistance( travelPoints: TravelPoints ) {
    return this._http
      .get( this._api + this._getStartAndFinish(travelPoints) + '?access_token=' + this._token )
      .map( (data: Routes) => {
        return data.routes[0].distance;
      });
  }

  private _getStartAndFinish( travelPoints: TravelPoints ): string {
    const start = travelPoints.start.lng + ',' + travelPoints.start.lat;
    const finish = travelPoints.finish.lng + ',' + travelPoints.finish.lat;
    return start + ';' + finish;
  }

}