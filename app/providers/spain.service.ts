import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import * as settings from 'application-settings';

@Injectable()
export class SpainService {

  private _api = 'http://datos.gob.es/apidata/nti/territory/';

  constructor(
    private _http: HttpClient
  ) { }

  getComunidadesAutonomas(){ 
    return this._http
      .get(this._api + 'Autonomous-region?_sort=label&_pageSize=50&_page=0')
      .map( (data: any) => {
        return this._getComunidadesNombre(data.result.items);
      });
  }
  
  getProvincias(autonomia?: string){
    return this._http
      .get(this._api + 'Province?_sort=label&_pageSize=50&_page=0')
      .map( (data: any) => {
        const comunidad = autonomia || settings.getString("autonomia");
        return this._getProvinciasNombre(data.result.items, comunidad);
      });
  }

  private _getComunidadesNombre( comunidades: any[] ){
    return comunidades
      .map( item => item.label);
  }

  private _getProvinciasNombre( provincias: any[], comunidad: string ){
    return provincias
      .filter( item => {
        const autonomiaInfoArray = item.autonomia.split('/');
        return autonomiaInfoArray[autonomiaInfoArray.length-1] === comunidad;
      })
      .map(item => item.label);
  }

  getTime(){
    // https://github.com/davidayalas/current-time
    return this._http.get('https://script.google.com/macros/s/AKfycbyd5AcbAnWi2Yn0xhFRbyzS4qMq1VucMVgVvhul5XqS9HkAyJY/exec?tz=Europe/Madrid');
  }

}