import { Component, ElementRef, OnInit } from '@angular/core';
import { registerElement } from "nativescript-angular/element-registry";
import { isEnabled, enableLocationRequest, getCurrentLocation, watchLocation, distance, clearWatch } from "nativescript-geolocation";
import { Mapbox, UserLocation } from 'nativescript-mapbox';
import { SpainService } from '../providers/spain.service';
import { AparcaoService } from '../providers/aparcao.service';
import { UtilsService } from '../tools/utils.service';
import { MapboxService } from  '../providers/mapbox.service';
import { LoadingIndicator } from "nativescript-loading-indicator";
import * as timer from 'timer';
/* import { BehaviorSubject, Subject } from 'rxjs/Rx'; */
import * as firebase from 'nativescript-plugin-firebase';
import * as dialogs from "ui/dialogs";
import * as connectivity from "tns-core-modules/connectivity";
import * as settings from 'application-settings';
import * as toast from 'nativescript-toast';
import * as app from "tns-core-modules/application";

registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);
const loader = new LoadingIndicator();

/* const mapbox = require('mapbox');
var client = new mapbox('pk.eyJ1IjoibmFjaG8xMjM0MzI0MjM0IiwiYSI6ImNqZDNqN25kYTExemwycXFqbmRmdTNsc2QifQ.CInjKy5qEWs39L-gy_Aepg'); */

// https://market.nativescript.org/plugins/nativescript-floatingactionbutton
// https://market.nativescript.org/plugins/nativescript-snackbar
// https://market.nativescript.org/plugins/nativescript-slides
// https://market.nativescript.org/plugins/nativescript-texttospeech

declare var android;

enum MarkerOptions {
  ocupar = 'Aparcao!',
  llevame = 'Muéstrame la ruta',
  ruta = 'Borrar ruta'
}

enum Icons {
  verde = 'green-car.png',
  amarillo = 'yellow-car.png',
  rojo = 'red-car.png'
}

class DrawnRoute {
  id: string;
  found: boolean;
}

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent {
  private _mapRef: Mapbox;
  private _drawnRoutes: string[] = [];
  private _points;

  constructor(
    private _spainService: SpainService,
    private _aparcaoService: AparcaoService,
    private _mapboxService: MapboxService
  ) { }

  setMarker(lat, lng, id, title?: string) {

    let icon = 'tools/assets/';

    if ( +title > 30 ) {
      icon += Icons.rojo;
    }else if ( +title > 15 ) {
      icon += Icons.amarillo;
    }else {
      icon += Icons.verde;
    }

    this._mapRef.addMarkers([
      {
        id: id,
        lat: lat,
        lng: lng,
        title: title !== undefined ? (title + ' min') : 'Sin tiempo',
        subtitle: 'Toca para realizar alguna acción.',
        iconPath: icon, 
        selected: false, // makes the callout show immediately when the marker is added (note: only 1 marker can be selected at a time)
        onCalloutTap: marker => this.onMarkerEvent(marker),
        // onTap: (c) => { console.dir(c); this.onMarkerEvent(c); }
      }]
    );
  }
    
  onMapReady(args) {
    this._mapRef = args.map;
    this._checkConnection();
  }
  
  savePoint() {

    this._checkLocation(() => {
      dialogs.confirm({
        title: "",
        message: "¿Dejar hueco libre?",
        okButtonText: "Si",
        cancelButtonText: "No"
      }).then(result => {
  
        if ( !result ) { return; }
  
        this._mapRef.getUserLocation()
          .then( (loc: UserLocation) => {
            
            this._aparcaoService.addPoint(loc.location.lat, loc.location.lng)
              .then(result => {
                toast.makeText('Has dejado el aparcamiento').show();
              });
            
          });
      });
    });

  }
    
  onMarkerEvent(marker) {

    const acciones: string[] = [ MarkerOptions.ocupar, MarkerOptions.llevame ];
    if ( this._drawnRoutes.indexOf(marker.id) !== -1 ) {
      acciones.push(MarkerOptions.ruta);
    }

    dialogs.action({
      message: "¿Qué quieres hacer?",
      cancelButtonText: "Cancelar",
      actions: acciones
    }).then((result) => {
      if(result === MarkerOptions.ocupar){
        
        this._checkLocation( () => {
          this._aparcao(marker);
        });

      }else if(result === MarkerOptions.llevame){
        this._checkLocation( () => {
          this._drawRoute(marker);
        });
      }else if(result === MarkerOptions.ruta){
        this._removeRoute(marker);
      }

    });
  }

  private _removeRoute(marker) {
    this._mapRef.removePolylines([marker.id]);
    this._drawnRoutes.slice(this._drawnRoutes.indexOf(marker.id),1);
  }
  
  private _drawRoute(marker) {

    this._mapRef.getUserLocation()
      .then( (loc: UserLocation) => {

        this._mapboxService.getDirections({
          start:{
            lat: loc.location.lat,
            lng: loc.location.lng
          },
          finish: {
            lat: marker.lat,
            lng: marker.lng
          }
        }).subscribe(data => {

          this._drawnRoutes.push(marker.id);

          this._mapRef.addPolyline({
            id: marker.id, // optional, can be used in 'removePolylines'
            color: '#336699', // Set the color of the line (default black)
            width: 7, // Set the width of the line (default 5)
            opacity: 1,
            points: data
          });
          
        });

      }, err => console.dir(err))
  }

  private _aparcao(marker) {

    if (android.provider.Settings.Secure.getString(app.android.context.getContentResolver(), android.provider.Settings.Secure.ALLOW_MOCK_LOCATION) !== '0') {
      toast.makeText('No puedes usar la aplicación con un GPS falso').show();
      dialogs.alert({
        title: "",
        message: "No puedes usar la aplicación con un GPS falso",
        okButtonText: "OK",
      });
      return;
    }

    this._mapRef.getUserLocation()
      .then( (loc: UserLocation) => {

        this._mapboxService.getDistance({
            start: { 
              lat: loc.location.lat,
              lng: loc.location.lng
            },
            finish: { 
              lat: marker.lat,
              lng: marker.lng
            }
          })
          .subscribe( distancia => {

            if ( distancia < 40 ) {
              const markerObject = {};
              markerObject[marker.id] = null;
              this._aparcaoService.removePoint(markerObject)
                .then( () => {
                  this._mapRef.removeMarkers([marker.id]);
                  toast.makeText('Has ocupado el aparcamiento').show();
                }, err => console.dir(err));
            }else {
              toast.makeText('No estás cerca para aparcar').show();
            }

          });

      }, err => console.dir(err));
  }
    
  private _checkConnection() {
    const connectionType = connectivity.getConnectionType();
    
    if ( connectionType === connectivity.connectionType.none ) {
      dialogs.alert({
        title: "",
        message: "No tienes conexión a internet.",
        okButtonText: "Comprobar conexión",
      })
      .then(() => {
        this._checkConnection();
      });
    }else {
      if ( settings.getString('autonomia') && settings.getString('provincia') ) {
        this._initFirebase();
      }else {
        this._getComunidadesAutonomas();
      }
    }

  }
  
  private _pointsChange() {

    toast.makeText('Cargando aparcamientos...').show();
    
    this._aparcaoService.getPoints().then(result => {
        this._points = result.value;
        console.dir(this._points);
        if ( !this._points ) {
          toast.makeText('No hay aparcamientos').show();
        }
        this._drawPoints(this._points);
      })
      .catch(err => {
        dialogs.alert({
          title: "",
          message: "Error cargando aparcamientos.",
          okButtonText: "Reintentar",
        })
        .then(() => {
          this._pointsChange();
        });
      });
  }

  private _drawPoints(points) {
    
    this._spainService.getTime()
      .subscribe((time: any) => {

        const currentTimestamp = new Date(time.fulldate).getTime();
        this._mapRef.removeMarkers();

        const drawnRouteToRemove: string[] = [];

        for (const key in points) {
          const markerNoExist = this._drawnRoutes.indexOf(key) === -1;
          if ( markerNoExist ) {
            drawnRouteToRemove.push(key);
          }
          
          this.setMarker(
            points[key].lat, 
            points[key].long, 
            key, 
            UtilsService.getTimestampsDiference( currentTimestamp, points[key].time ) + '');
        }

        this._mapRef.removePolylines(drawnRouteToRemove);
      }, err => {
        console.dir(err);
      });
  }

  private _initFirebase() {

    this._aparcaoService.initFirebase() 
      .then(() => {
        
        this._aparcaoService.listenChanges(this._pointsChange.bind(this))
          .then(() => {
            setInterval(() => {
              const points = this._points || {};
              this._drawPoints(this._points);
            }, 90000);
          });

        /* firebase.addValueEventListener(this._pointsChange.bind(this), "/points/Andalucia/Sevilla") */
        /* .then(
          (listenerWrapper) => {
            var path = listenerWrapper.path;
            var listeners = listenerWrapper.listeners; // an Array of listeners added
            // you can store the wrapper somewhere to later call 'removeEventListeners'
          }
        ); */

      }, err => {
        dialogs.alert({
          title: "",
          message: "Error en la carga inicial de datos.",
          okButtonText: "Reintentar",
        })
        .then(() => {
          this._initFirebase();
        });
      }); 
  }
    
  private _checkLocation(success){
    
    this._mapRef.getUserLocation()
      .then( (userLocation: UserLocation) => {
        success();
      }, err => {
        dialogs.confirm({
          title: "",
          message: "Necesitas activar el GPS para realizar esta acción.",
          okButtonText: "Activar",
          cancelButtonText: "No activar"
        }).then(activar => {

          if ( !activar ) { return; }

          enableLocationRequest()
            .then(() => {
              success();
            }, (e) => { 
              console.log("Error: " + (e.message || e));
            });
        });
      });

  }

  private _getComunidadesAutonomas() {
    
    toast.makeText('Cargando comunidades...').show();

    this._spainService.getComunidadesAutonomas()
      .subscribe( (comunidades: any) => {

          dialogs.action({
              message: "¿En qué comunidad estás?",
              actions: comunidades
          }).then(result => {

            const aut = UtilsService.transformRegionName(result);
            toast.makeText('Cargando provincias...').show();

            this._spainService.getProvincias(aut)
            .subscribe((provincias:any) => {
              dialogs.action({
                message: "¿En qué provincia estás?",
                actions: provincias
              })
              .then(result => {
                const pro = UtilsService.transformRegionName(result);
                settings.setString("autonomia", aut);
                settings.setString("provincia", pro);
                this._initFirebase();
              });
            });
              
          });
        
      });
  }
    
}
