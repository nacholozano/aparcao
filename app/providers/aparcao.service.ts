import { Injectable } from '@angular/core';
import * as firebase from 'nativescript-plugin-firebase';
import * as settings from 'application-settings';

@Injectable()
export class AparcaoService {

  constructor(
  ) { }

  initFirebase(): Promise<any> {
    return firebase.init({
      persist: false
    });
  }

  getPoints(): Promise<any>{
    return firebase.getValue(this._getPathDb());
  }

  addPoint(lat: number | string, long: number | string): Promise<any>{
    return firebase.push(
      this._getPathDb(),
      {
        lat: lat,
        long: long,
        time: firebase.ServerValue.TIMESTAMP
      });
  }

  removePoint(point: Object): Promise<any> {
    return firebase.update(
      this._getPathDb(),
      point
    );
  }

  listenChanges( fn: () => {} ): Promise<any> {
    return firebase.addValueEventListener(fn, this._getPathDb() );
  }
  
  private _getPathDb(): string{
    return '/points/' + settings.getString("autonomia") + '/' + settings.getString("provincia");
  }

}