import { Injectable } from '@angular/core';

class Replace {
  old: string;
  new: string;
}

export class UtilsService {

  private static _replacement: Replace[]  = [
    { old: ' ', new: '-' },
    { old: 'ñ', new: 'n' },
    { old: 'á', new: 'a' },
    { old: 'é', new: 'e' },
    { old: 'í', new: 'i' },
    { old: 'ó', new: 'o' },
    { old: 'ú', new: 'u' }
  ]

  constructor() { }

  static transformRegionName(name: string): string {
    let result = name;

    this._replacement.forEach( replace => {
      result = result.replace( replace.old, replace.new );
    });

    return result;
  }

  static getTimestampsDiference(t1: number, t2: number){

    const t = t1 - t2;
    const date = new Date(t);
    const hours = date.getHours() > 0 
      ? date.getHours() - 1 
      : 0;

    return t <= 0 
      ? 0 
      : 60 * hours + date.getMinutes();
  }

}