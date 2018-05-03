"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var element_registry_1 = require("nativescript-angular/element-registry");
var nativescript_geolocation_1 = require("nativescript-geolocation");
var spain_service_1 = require("../providers/spain.service");
var aparcao_service_1 = require("../providers/aparcao.service");
var utils_service_1 = require("../tools/utils.service");
var mapbox_service_1 = require("../providers/mapbox.service");
var nativescript_loading_indicator_1 = require("nativescript-loading-indicator");
var dialogs = require("ui/dialogs");
var connectivity = require("tns-core-modules/connectivity");
var settings = require("application-settings");
var toast = require("nativescript-toast");
var app = require("tns-core-modules/application");
element_registry_1.registerElement("Mapbox", function () { return require("nativescript-mapbox").MapboxView; });
var loader = new nativescript_loading_indicator_1.LoadingIndicator();
var MarkerOptions;
(function (MarkerOptions) {
    MarkerOptions["ocupar"] = "Aparcao!";
    MarkerOptions["llevame"] = "Mu\u00E9strame la ruta";
    MarkerOptions["ruta"] = "Borrar ruta";
})(MarkerOptions || (MarkerOptions = {}));
var Icons;
(function (Icons) {
    Icons["verde"] = "green-car.png";
    Icons["amarillo"] = "yellow-car.png";
    Icons["rojo"] = "red-car.png";
})(Icons || (Icons = {}));
var DrawnRoute = /** @class */ (function () {
    function DrawnRoute() {
    }
    return DrawnRoute;
}());
var HomeComponent = /** @class */ (function () {
    function HomeComponent(_spainService, _aparcaoService, _mapboxService) {
        this._spainService = _spainService;
        this._aparcaoService = _aparcaoService;
        this._mapboxService = _mapboxService;
        this._drawnRoutes = [];
    }
    HomeComponent.prototype.setMarker = function (lat, lng, id, title) {
        var _this = this;
        var icon = 'tools/assets/';
        if (+title > 30) {
            icon += Icons.rojo;
        }
        else if (+title > 15) {
            icon += Icons.amarillo;
        }
        else {
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
                selected: false,
                onCalloutTap: function (marker) { return _this.onMarkerEvent(marker); },
            }
        ]);
    };
    HomeComponent.prototype.onMapReady = function (args) {
        this._mapRef = args.map;
        this._checkConnection();
    };
    HomeComponent.prototype.savePoint = function () {
        var _this = this;
        this._checkLocation(function () {
            dialogs.confirm({
                title: "",
                message: "¿Dejar hueco libre?",
                okButtonText: "Si",
                cancelButtonText: "No"
            }).then(function (result) {
                if (!result) {
                    return;
                }
                _this._mapRef.getUserLocation()
                    .then(function (loc) {
                    _this._aparcaoService.addPoint(loc.location.lat, loc.location.lng)
                        .then(function (result) {
                        toast.makeText('Has dejado el aparcamiento').show();
                    });
                });
            });
        });
    };
    HomeComponent.prototype.onMarkerEvent = function (marker) {
        var _this = this;
        var acciones = [MarkerOptions.ocupar, MarkerOptions.llevame];
        if (this._drawnRoutes.indexOf(marker.id) !== -1) {
            acciones.push(MarkerOptions.ruta);
        }
        dialogs.action({
            message: "¿Qué quieres hacer?",
            cancelButtonText: "Cancelar",
            actions: acciones
        }).then(function (result) {
            if (result === MarkerOptions.ocupar) {
                _this._checkLocation(function () {
                    _this._aparcao(marker);
                });
            }
            else if (result === MarkerOptions.llevame) {
                _this._checkLocation(function () {
                    _this._drawRoute(marker);
                });
            }
            else if (result === MarkerOptions.ruta) {
                _this._removeRoute(marker);
            }
        });
    };
    HomeComponent.prototype._removeRoute = function (marker) {
        this._mapRef.removePolylines([marker.id]);
        this._drawnRoutes.slice(this._drawnRoutes.indexOf(marker.id), 1);
    };
    HomeComponent.prototype._drawRoute = function (marker) {
        var _this = this;
        this._mapRef.getUserLocation()
            .then(function (loc) {
            _this._mapboxService.getDirections({
                start: {
                    lat: loc.location.lat,
                    lng: loc.location.lng
                },
                finish: {
                    lat: marker.lat,
                    lng: marker.lng
                }
            }).subscribe(function (data) {
                _this._drawnRoutes.push(marker.id);
                _this._mapRef.addPolyline({
                    id: marker.id,
                    color: '#336699',
                    width: 7,
                    opacity: 1,
                    points: data
                });
            });
        }, function (err) { return console.dir(err); });
    };
    HomeComponent.prototype._aparcao = function (marker) {
        var _this = this;
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
            .then(function (loc) {
            _this._mapboxService.getDistance({
                start: {
                    lat: loc.location.lat,
                    lng: loc.location.lng
                },
                finish: {
                    lat: marker.lat,
                    lng: marker.lng
                }
            })
                .subscribe(function (distancia) {
                if (distancia < 40) {
                    var markerObject = {};
                    markerObject[marker.id] = null;
                    _this._aparcaoService.removePoint(markerObject)
                        .then(function () {
                        _this._mapRef.removeMarkers([marker.id]);
                        toast.makeText('Has ocupado el aparcamiento').show();
                    }, function (err) { return console.dir(err); });
                }
                else {
                    toast.makeText('No estás cerca para aparcar').show();
                }
            });
        }, function (err) { return console.dir(err); });
    };
    HomeComponent.prototype._checkConnection = function () {
        var _this = this;
        var connectionType = connectivity.getConnectionType();
        if (connectionType === connectivity.connectionType.none) {
            dialogs.alert({
                title: "",
                message: "No tienes conexión a internet.",
                okButtonText: "Comprobar conexión",
            })
                .then(function () {
                _this._checkConnection();
            });
        }
        else {
            if (settings.getString('autonomia') && settings.getString('provincia')) {
                this._initFirebase();
            }
            else {
                this._getComunidadesAutonomas();
            }
        }
    };
    HomeComponent.prototype._pointsChange = function () {
        var _this = this;
        toast.makeText('Cargando aparcamientos...').show();
        this._aparcaoService.getPoints().then(function (result) {
            _this._points = result.value;
            console.dir(_this._points);
            if (!_this._points) {
                toast.makeText('No hay aparcamientos').show();
            }
            _this._drawPoints(_this._points);
        })
            .catch(function (err) {
            dialogs.alert({
                title: "",
                message: "Error cargando aparcamientos.",
                okButtonText: "Reintentar",
            })
                .then(function () {
                _this._pointsChange();
            });
        });
    };
    HomeComponent.prototype._drawPoints = function (points) {
        var _this = this;
        this._spainService.getTime()
            .subscribe(function (time) {
            var currentTimestamp = new Date(time.fulldate).getTime();
            _this._mapRef.removeMarkers();
            var drawnRouteToRemove = [];
            for (var key in points) {
                var markerNoExist = _this._drawnRoutes.indexOf(key) === -1;
                if (markerNoExist) {
                    drawnRouteToRemove.push(key);
                }
                _this.setMarker(points[key].lat, points[key].long, key, utils_service_1.UtilsService.getTimestampsDiference(currentTimestamp, points[key].time) + '');
            }
            _this._mapRef.removePolylines(drawnRouteToRemove);
        }, function (err) {
            console.dir(err);
        });
    };
    HomeComponent.prototype._initFirebase = function () {
        var _this = this;
        this._aparcaoService.initFirebase()
            .then(function () {
            _this._aparcaoService.listenChanges(_this._pointsChange.bind(_this))
                .then(function () {
                setInterval(function () {
                    var points = _this._points || {};
                    _this._drawPoints(_this._points);
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
        }, function (err) {
            dialogs.alert({
                title: "",
                message: "Error en la carga inicial de datos.",
                okButtonText: "Reintentar",
            })
                .then(function () {
                _this._initFirebase();
            });
        });
    };
    HomeComponent.prototype._checkLocation = function (success) {
        this._mapRef.getUserLocation()
            .then(function (userLocation) {
            success();
        }, function (err) {
            dialogs.confirm({
                title: "",
                message: "Necesitas activar el GPS para realizar esta acción.",
                okButtonText: "Activar",
                cancelButtonText: "No activar"
            }).then(function (activar) {
                if (!activar) {
                    return;
                }
                nativescript_geolocation_1.enableLocationRequest()
                    .then(function () {
                    success();
                }, function (e) {
                    console.log("Error: " + (e.message || e));
                });
            });
        });
    };
    HomeComponent.prototype._getComunidadesAutonomas = function () {
        var _this = this;
        toast.makeText('Cargando comunidades...').show();
        this._spainService.getComunidadesAutonomas()
            .subscribe(function (comunidades) {
            dialogs.action({
                message: "¿En qué comunidad estás?",
                actions: comunidades
            }).then(function (result) {
                var aut = utils_service_1.UtilsService.transformRegionName(result);
                toast.makeText('Cargando provincias...').show();
                _this._spainService.getProvincias(aut)
                    .subscribe(function (provincias) {
                    dialogs.action({
                        message: "¿En qué provincia estás?",
                        actions: provincias
                    })
                        .then(function (result) {
                        var pro = utils_service_1.UtilsService.transformRegionName(result);
                        settings.setString("autonomia", aut);
                        settings.setString("provincia", pro);
                        _this._initFirebase();
                    });
                });
            });
        });
    };
    HomeComponent = __decorate([
        core_1.Component({
            selector: "Home",
            moduleId: module.id,
            templateUrl: "./home.component.html"
        }),
        __metadata("design:paramtypes", [spain_service_1.SpainService,
            aparcao_service_1.AparcaoService,
            mapbox_service_1.MapboxService])
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJob21lLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUE4RDtBQUM5RCwwRUFBd0U7QUFDeEUscUVBQXFJO0FBRXJJLDREQUEwRDtBQUMxRCxnRUFBOEQ7QUFDOUQsd0RBQXNEO0FBQ3RELDhEQUE2RDtBQUM3RCxpRkFBa0U7QUFJbEUsb0NBQXNDO0FBQ3RDLDREQUE4RDtBQUM5RCwrQ0FBaUQ7QUFDakQsMENBQTRDO0FBQzVDLGtEQUFvRDtBQUVwRCxrQ0FBZSxDQUFDLFFBQVEsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsVUFBVSxFQUF6QyxDQUF5QyxDQUFDLENBQUM7QUFDM0UsSUFBTSxNQUFNLEdBQUcsSUFBSSxpREFBZ0IsRUFBRSxDQUFDO0FBWXRDLElBQUssYUFJSjtBQUpELFdBQUssYUFBYTtJQUNoQixvQ0FBbUIsQ0FBQTtJQUNuQixtREFBNkIsQ0FBQTtJQUM3QixxQ0FBb0IsQ0FBQTtBQUN0QixDQUFDLEVBSkksYUFBYSxLQUFiLGFBQWEsUUFJakI7QUFFRCxJQUFLLEtBSUo7QUFKRCxXQUFLLEtBQUs7SUFDUixnQ0FBdUIsQ0FBQTtJQUN2QixvQ0FBMkIsQ0FBQTtJQUMzQiw2QkFBb0IsQ0FBQTtBQUN0QixDQUFDLEVBSkksS0FBSyxLQUFMLEtBQUssUUFJVDtBQUVEO0lBQUE7SUFHQSxDQUFDO0lBQUQsaUJBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQU9EO0lBS0UsdUJBQ1UsYUFBMkIsRUFDM0IsZUFBK0IsRUFDL0IsY0FBNkI7UUFGN0Isa0JBQWEsR0FBYixhQUFhLENBQWM7UUFDM0Isb0JBQWUsR0FBZixlQUFlLENBQWdCO1FBQy9CLG1CQUFjLEdBQWQsY0FBYyxDQUFlO1FBTi9CLGlCQUFZLEdBQWEsRUFBRSxDQUFDO0lBT2hDLENBQUM7SUFFTCxpQ0FBUyxHQUFULFVBQVUsR0FBRyxF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MlZDO0FBM1ZZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgcmVnaXN0ZXJFbGVtZW50IH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL2VsZW1lbnQtcmVnaXN0cnlcIjtcclxuaW1wb3J0IHsgaXNFbmFibGVkLCBlbmFibGVMb2NhdGlvblJlcXVlc3QsIGdldEN1cnJlbnRMb2NhdGlvbiwgd2F0Y2hMb2NhdGlvbiwgZGlzdGFuY2UsIGNsZWFyV2F0Y2ggfSBmcm9tIFwibmF0aXZlc2NyaXB0LWdlb2xvY2F0aW9uXCI7XHJcbmltcG9ydCB7IE1hcGJveCwgVXNlckxvY2F0aW9uIH0gZnJvbSAnbmF0aXZlc2NyaXB0LW1hcGJveCc7XHJcbmltcG9ydCB7IFNwYWluU2VydmljZSB9IGZyb20gJy4uL3Byb3ZpZGVycy9zcGFpbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXBhcmNhb1NlcnZpY2UgfSBmcm9tICcuLi9wcm92aWRlcnMvYXBhcmNhby5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXRpbHNTZXJ2aWNlIH0gZnJvbSAnLi4vdG9vbHMvdXRpbHMuc2VydmljZSc7XHJcbmltcG9ydCB7IE1hcGJveFNlcnZpY2UgfSBmcm9tICAnLi4vcHJvdmlkZXJzL21hcGJveC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9hZGluZ0luZGljYXRvciB9IGZyb20gXCJuYXRpdmVzY3JpcHQtbG9hZGluZy1pbmRpY2F0b3JcIjtcclxuaW1wb3J0ICogYXMgdGltZXIgZnJvbSAndGltZXInO1xyXG4vKiBpbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIFN1YmplY3QgfSBmcm9tICdyeGpzL1J4JzsgKi9cclxuaW1wb3J0ICogYXMgZmlyZWJhc2UgZnJvbSAnbmF0aXZlc2NyaXB0LXBsdWdpbi1maXJlYmFzZSc7XHJcbmltcG9ydCAqIGFzIGRpYWxvZ3MgZnJvbSBcInVpL2RpYWxvZ3NcIjtcclxuaW1wb3J0ICogYXMgY29ubmVjdGl2aXR5IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2Nvbm5lY3Rpdml0eVwiO1xyXG5pbXBvcnQgKiBhcyBzZXR0aW5ncyBmcm9tICdhcHBsaWNhdGlvbi1zZXR0aW5ncyc7XHJcbmltcG9ydCAqIGFzIHRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XHJcbmltcG9ydCAqIGFzIGFwcCBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvblwiO1xyXG5cclxucmVnaXN0ZXJFbGVtZW50KFwiTWFwYm94XCIsICgpID0+IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtbWFwYm94XCIpLk1hcGJveFZpZXcpO1xyXG5jb25zdCBsb2FkZXIgPSBuZXcgTG9hZGluZ0luZGljYXRvcigpO1xyXG5cclxuLyogY29uc3QgbWFwYm94ID0gcmVxdWlyZSgnbWFwYm94Jyk7XHJcbnZhciBjbGllbnQgPSBuZXcgbWFwYm94KCdway5leUoxSWpvaWJtRmphRzh4TWpNME16STBNak0wSWl3aVlTSTZJbU5xWkROcU4yNWtZVEV4ZW13eWNYRnFibVJtZFROc2MyUWlmUS5DSW5qS3k1cUVXczM5TC1neV9BZXBnJyk7ICovXHJcblxyXG4vLyBodHRwczovL21hcmtldC5uYXRpdmVzY3JpcHQub3JnL3BsdWdpbnMvbmF0aXZlc2NyaXB0LWZsb2F0aW5nYWN0aW9uYnV0dG9uXHJcbi8vIGh0dHBzOi8vbWFya2V0Lm5hdGl2ZXNjcmlwdC5vcmcvcGx1Z2lucy9uYXRpdmVzY3JpcHQtc25hY2tiYXJcclxuLy8gaHR0cHM6Ly9tYXJrZXQubmF0aXZlc2NyaXB0Lm9yZy9wbHVnaW5zL25hdGl2ZXNjcmlwdC1zbGlkZXNcclxuLy8gaHR0cHM6Ly9tYXJrZXQubmF0aXZlc2NyaXB0Lm9yZy9wbHVnaW5zL25hdGl2ZXNjcmlwdC10ZXh0dG9zcGVlY2hcclxuXHJcbmRlY2xhcmUgdmFyIGFuZHJvaWQ7XHJcblxyXG5lbnVtIE1hcmtlck9wdGlvbnMge1xyXG4gIG9jdXBhciA9ICdBcGFyY2FvIScsXHJcbiAgbGxldmFtZSA9ICdNdcOpc3RyYW1lIGxhIHJ1dGEnLFxyXG4gIHJ1dGEgPSAnQm9ycmFyIHJ1dGEnXHJcbn1cclxuXHJcbmVudW0gSWNvbnMge1xyXG4gIHZlcmRlID0gJ2dyZWVuLWNhci5wbmcnLFxyXG4gIGFtYXJpbGxvID0gJ3llbGxvdy1jYXIucG5nJyxcclxuICByb2pvID0gJ3JlZC1jYXIucG5nJ1xyXG59XHJcblxyXG5jbGFzcyBEcmF3blJvdXRlIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGZvdW5kOiBib29sZWFuO1xyXG59XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiBcIkhvbWVcIixcclxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXHJcbiAgICB0ZW1wbGF0ZVVybDogXCIuL2hvbWUuY29tcG9uZW50Lmh0bWxcIlxyXG59KVxyXG5leHBvcnQgY2xhc3MgSG9tZUNvbXBvbmVudCB7XHJcbiAgcHJpdmF0ZSBfbWFwUmVmOiBNYXBib3g7XHJcbiAgcHJpdmF0ZSBfZHJhd25Sb3V0ZXM6IHN0cmluZ1tdID0gW107XHJcbiAgcHJpdmF0ZSBfcG9pbnRzO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgX3NwYWluU2VydmljZTogU3BhaW5TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBfYXBhcmNhb1NlcnZpY2U6IEFwYXJjYW9TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBfbWFwYm94U2VydmljZTogTWFwYm94U2VydmljZVxyXG4gICkgeyB9XHJcblxyXG4gIHNldE1hcmtlcihsYXQsIGxuZywgaWQsIHRpdGxlPzogc3RyaW5nKSB7XHJcblxyXG4gICAgbGV0IGljb24gPSAndG9vbHMvYXNzZXRzLyc7XHJcblxyXG4gICAgaWYgKCArdGl0bGUgPiAzMCApIHtcclxuICAgICAgaWNvbiArPSBJY29ucy5yb2pvO1xyXG4gICAgfWVsc2UgaWYgKCArdGl0bGUgPiAxNSApIHtcclxuICAgICAgaWNvbiArPSBJY29ucy5hbWFyaWxsbztcclxuICAgIH1lbHNlIHtcclxuICAgICAgaWNvbiArPSBJY29ucy52ZXJkZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9tYXBSZWYuYWRkTWFya2VycyhbXHJcbiAgICAgIHtcclxuICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgbGF0OiBsYXQsXHJcbiAgICAgICAgbG5nOiBsbmcsXHJcbiAgICAgICAgdGl0bGU6IHRpdGxlICE9PSB1bmRlZmluZWQgPyAodGl0bGUgKyAnIG1pbicpIDogJ1NpbiB0aWVtcG8nLFxyXG4gICAgICAgIHN1YnRpdGxlOiAnVG9jYSBwYXJhIHJlYWxpemFyIGFsZ3VuYSBhY2Npw7NuLicsXHJcbiAgICAgICAgaWNvblBhdGg6IGljb24sIFxyXG4gICAgICAgIHNlbGVjdGVkOiBmYWxzZSwgLy8gbWFrZXMgdGhlIGNhbGxvdXQgc2hvdyBpbW1lZGlhdGVseSB3aGVuIHRoZSBtYXJrZXIgaXMgYWRkZWQgKG5vdGU6IG9ubHkgMSBtYXJrZXIgY2FuIGJlIHNlbGVjdGVkIGF0IGEgdGltZSlcclxuICAgICAgICBvbkNhbGxvdXRUYXA6IG1hcmtlciA9PiB0aGlzLm9uTWFya2VyRXZlbnQobWFya2VyKSxcclxuICAgICAgICAvLyBvblRhcDogKGMpID0+IHsgY29uc29sZS5kaXIoYyk7IHRoaXMub25NYXJrZXJFdmVudChjKTsgfVxyXG4gICAgICB9XVxyXG4gICAgKTtcclxuICB9XHJcbiAgICBcclxuICBvbk1hcFJlYWR5KGFyZ3MpIHtcclxuICAgIHRoaXMuX21hcFJlZiA9IGFyZ3MubWFwO1xyXG4gICAgdGhpcy5fY2hlY2tDb25uZWN0aW9uKCk7XHJcbiAgfVxyXG4gIFxyXG4gIHNhdmVQb2ludCgpIHtcclxuXHJcbiAgICB0aGlzLl9jaGVja0xvY2F0aW9uKCgpID0+IHtcclxuICAgICAgZGlhbG9ncy5jb25maXJtKHtcclxuICAgICAgICB0aXRsZTogXCJcIixcclxuICAgICAgICBtZXNzYWdlOiBcIsK/RGVqYXIgaHVlY28gbGlicmU/XCIsXHJcbiAgICAgICAgb2tCdXR0b25UZXh0OiBcIlNpXCIsXHJcbiAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogXCJOb1wiXHJcbiAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcclxuICBcclxuICAgICAgICBpZiAoICFyZXN1bHQgKSB7IHJldHVybjsgfVxyXG4gIFxyXG4gICAgICAgIHRoaXMuX21hcFJlZi5nZXRVc2VyTG9jYXRpb24oKVxyXG4gICAgICAgICAgLnRoZW4oIChsb2M6IFVzZXJMb2NhdGlvbikgPT4ge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5fYXBhcmNhb1NlcnZpY2UuYWRkUG9pbnQobG9jLmxvY2F0aW9uLmxhdCwgbG9jLmxvY2F0aW9uLmxuZylcclxuICAgICAgICAgICAgICAudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAgICAgdG9hc3QubWFrZVRleHQoJ0hhcyBkZWphZG8gZWwgYXBhcmNhbWllbnRvJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICB9XHJcbiAgICBcclxuICBvbk1hcmtlckV2ZW50KG1hcmtlcikge1xyXG5cclxuICAgIGNvbnN0IGFjY2lvbmVzOiBzdHJpbmdbXSA9IFsgTWFya2VyT3B0aW9ucy5vY3VwYXIsIE1hcmtlck9wdGlvbnMubGxldmFtZSBdO1xyXG4gICAgaWYgKCB0aGlzLl9kcmF3blJvdXRlcy5pbmRleE9mKG1hcmtlci5pZCkgIT09IC0xICkge1xyXG4gICAgICBhY2Npb25lcy5wdXNoKE1hcmtlck9wdGlvbnMucnV0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGlhbG9ncy5hY3Rpb24oe1xyXG4gICAgICBtZXNzYWdlOiBcIsK/UXXDqSBxdWllcmVzIGhhY2VyP1wiLFxyXG4gICAgICBjYW5jZWxCdXR0b25UZXh0OiBcIkNhbmNlbGFyXCIsXHJcbiAgICAgIGFjdGlvbnM6IGFjY2lvbmVzXHJcbiAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgaWYocmVzdWx0ID09PSBNYXJrZXJPcHRpb25zLm9jdXBhcil7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fY2hlY2tMb2NhdGlvbiggKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5fYXBhcmNhbyhtYXJrZXIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgfWVsc2UgaWYocmVzdWx0ID09PSBNYXJrZXJPcHRpb25zLmxsZXZhbWUpe1xyXG4gICAgICAgIHRoaXMuX2NoZWNrTG9jYXRpb24oICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuX2RyYXdSb3V0ZShtYXJrZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9ZWxzZSBpZihyZXN1bHQgPT09IE1hcmtlck9wdGlvbnMucnV0YSl7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlUm91dGUobWFya2VyKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcmVtb3ZlUm91dGUobWFya2VyKSB7XHJcbiAgICB0aGlzLl9tYXBSZWYucmVtb3ZlUG9seWxpbmVzKFttYXJrZXIuaWRdKTtcclxuICAgIHRoaXMuX2RyYXduUm91dGVzLnNsaWNlKHRoaXMuX2RyYXduUm91dGVzLmluZGV4T2YobWFya2VyLmlkKSwxKTtcclxuICB9XHJcbiAgXHJcbiAgcHJpdmF0ZSBfZHJhd1JvdXRlKG1hcmtlcikge1xyXG5cclxuICAgIHRoaXMuX21hcFJlZi5nZXRVc2VyTG9jYXRpb24oKVxyXG4gICAgICAudGhlbiggKGxvYzogVXNlckxvY2F0aW9uKSA9PiB7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcGJveFNlcnZpY2UuZ2V0RGlyZWN0aW9ucyh7XHJcbiAgICAgICAgICBzdGFydDp7XHJcbiAgICAgICAgICAgIGxhdDogbG9jLmxvY2F0aW9uLmxhdCxcclxuICAgICAgICAgICAgbG5nOiBsb2MubG9jYXRpb24ubG5nXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZmluaXNoOiB7XHJcbiAgICAgICAgICAgIGxhdDogbWFya2VyLmxhdCxcclxuICAgICAgICAgICAgbG5nOiBtYXJrZXIubG5nXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSkuc3Vic2NyaWJlKGRhdGEgPT4ge1xyXG5cclxuICAgICAgICAgIHRoaXMuX2RyYXduUm91dGVzLnB1c2gobWFya2VyLmlkKTtcclxuXHJcbiAgICAgICAgICB0aGlzLl9tYXBSZWYuYWRkUG9seWxpbmUoe1xyXG4gICAgICAgICAgICBpZDogbWFya2VyLmlkLCAvLyBvcHRpb25hbCwgY2FuIGJlIHVzZWQgaW4gJ3JlbW92ZVBvbHlsaW5lcydcclxuICAgICAgICAgICAgY29sb3I6ICcjMzM2Njk5JywgLy8gU2V0IHRoZSBjb2xvciBvZiB0aGUgbGluZSAoZGVmYXVsdCBibGFjaylcclxuICAgICAgICAgICAgd2lkdGg6IDcsIC8vIFNldCB0aGUgd2lkdGggb2YgdGhlIGxpbmUgKGRlZmF1bHQgNSlcclxuICAgICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgICAgcG9pbnRzOiBkYXRhXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgfSwgZXJyID0+IGNvbnNvbGUuZGlyKGVycikpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9hcGFyY2FvKG1hcmtlcikge1xyXG5cclxuICAgIGlmIChhbmRyb2lkLnByb3ZpZGVyLlNldHRpbmdzLlNlY3VyZS5nZXRTdHJpbmcoYXBwLmFuZHJvaWQuY29udGV4dC5nZXRDb250ZW50UmVzb2x2ZXIoKSwgYW5kcm9pZC5wcm92aWRlci5TZXR0aW5ncy5TZWN1cmUuQUxMT1dfTU9DS19MT0NBVElPTikgIT09ICcwJykge1xyXG4gICAgICB0b2FzdC5tYWtlVGV4dCgnTm8gcHVlZGVzIHVzYXIgbGEgYXBsaWNhY2nDs24gY29uIHVuIEdQUyBmYWxzbycpLnNob3coKTtcclxuICAgICAgZGlhbG9ncy5hbGVydCh7XHJcbiAgICAgICAgdGl0bGU6IFwiXCIsXHJcbiAgICAgICAgbWVzc2FnZTogXCJObyBwdWVkZXMgdXNhciBsYSBhcGxpY2FjacOzbiBjb24gdW4gR1BTIGZhbHNvXCIsXHJcbiAgICAgICAgb2tCdXR0b25UZXh0OiBcIk9LXCIsXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fbWFwUmVmLmdldFVzZXJMb2NhdGlvbigpXHJcbiAgICAgIC50aGVuKCAobG9jOiBVc2VyTG9jYXRpb24pID0+IHtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFwYm94U2VydmljZS5nZXREaXN0YW5jZSh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiB7IFxyXG4gICAgICAgICAgICAgIGxhdDogbG9jLmxvY2F0aW9uLmxhdCxcclxuICAgICAgICAgICAgICBsbmc6IGxvYy5sb2NhdGlvbi5sbmdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmluaXNoOiB7IFxyXG4gICAgICAgICAgICAgIGxhdDogbWFya2VyLmxhdCxcclxuICAgICAgICAgICAgICBsbmc6IG1hcmtlci5sbmdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5zdWJzY3JpYmUoIGRpc3RhbmNpYSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIGRpc3RhbmNpYSA8IDQwICkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1hcmtlck9iamVjdCA9IHt9O1xyXG4gICAgICAgICAgICAgIG1hcmtlck9iamVjdFttYXJrZXIuaWRdID0gbnVsbDtcclxuICAgICAgICAgICAgICB0aGlzLl9hcGFyY2FvU2VydmljZS5yZW1vdmVQb2ludChtYXJrZXJPYmplY3QpXHJcbiAgICAgICAgICAgICAgICAudGhlbiggKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLl9tYXBSZWYucmVtb3ZlTWFya2VycyhbbWFya2VyLmlkXSk7XHJcbiAgICAgICAgICAgICAgICAgIHRvYXN0Lm1ha2VUZXh0KCdIYXMgb2N1cGFkbyBlbCBhcGFyY2FtaWVudG8nKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9LCBlcnIgPT4gY29uc29sZS5kaXIoZXJyKSk7XHJcbiAgICAgICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgICB0b2FzdC5tYWtlVGV4dCgnTm8gZXN0w6FzIGNlcmNhIHBhcmEgYXBhcmNhcicpLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgfSwgZXJyID0+IGNvbnNvbGUuZGlyKGVycikpO1xyXG4gIH1cclxuICAgIFxyXG4gIHByaXZhdGUgX2NoZWNrQ29ubmVjdGlvbigpIHtcclxuICAgIGNvbnN0IGNvbm5lY3Rpb25UeXBlID0gY29ubmVjdGl2aXR5LmdldENvbm5lY3Rpb25UeXBlKCk7XHJcbiAgICBcclxuICAgIGlmICggY29ubmVjdGlvblR5cGUgPT09IGNvbm5lY3Rpdml0eS5jb25uZWN0aW9uVHlwZS5ub25lICkge1xyXG4gICAgICBkaWFsb2dzLmFsZXJ0KHtcclxuICAgICAgICB0aXRsZTogXCJcIixcclxuICAgICAgICBtZXNzYWdlOiBcIk5vIHRpZW5lcyBjb25leGnDs24gYSBpbnRlcm5ldC5cIixcclxuICAgICAgICBva0J1dHRvblRleHQ6IFwiQ29tcHJvYmFyIGNvbmV4acOzblwiLFxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fY2hlY2tDb25uZWN0aW9uKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfWVsc2Uge1xyXG4gICAgICBpZiAoIHNldHRpbmdzLmdldFN0cmluZygnYXV0b25vbWlhJykgJiYgc2V0dGluZ3MuZ2V0U3RyaW5nKCdwcm92aW5jaWEnKSApIHtcclxuICAgICAgICB0aGlzLl9pbml0RmlyZWJhc2UoKTtcclxuICAgICAgfWVsc2Uge1xyXG4gICAgICAgIHRoaXMuX2dldENvbXVuaWRhZGVzQXV0b25vbWFzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfVxyXG4gIFxyXG4gIHByaXZhdGUgX3BvaW50c0NoYW5nZSgpIHtcclxuXHJcbiAgICB0b2FzdC5tYWtlVGV4dCgnQ2FyZ2FuZG8gYXBhcmNhbWllbnRvcy4uLicpLnNob3coKTtcclxuICAgIFxyXG4gICAgdGhpcy5fYXBhcmNhb1NlcnZpY2UuZ2V0UG9pbnRzKCkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgIHRoaXMuX3BvaW50cyA9IHJlc3VsdC52YWx1ZTtcclxuICAgICAgICBjb25zb2xlLmRpcih0aGlzLl9wb2ludHMpO1xyXG4gICAgICAgIGlmICggIXRoaXMuX3BvaW50cyApIHtcclxuICAgICAgICAgIHRvYXN0Lm1ha2VUZXh0KCdObyBoYXkgYXBhcmNhbWllbnRvcycpLnNob3coKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZHJhd1BvaW50cyh0aGlzLl9wb2ludHMpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICBkaWFsb2dzLmFsZXJ0KHtcclxuICAgICAgICAgIHRpdGxlOiBcIlwiLFxyXG4gICAgICAgICAgbWVzc2FnZTogXCJFcnJvciBjYXJnYW5kbyBhcGFyY2FtaWVudG9zLlwiLFxyXG4gICAgICAgICAgb2tCdXR0b25UZXh0OiBcIlJlaW50ZW50YXJcIixcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuX3BvaW50c0NoYW5nZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2RyYXdQb2ludHMocG9pbnRzKSB7XHJcbiAgICBcclxuICAgIHRoaXMuX3NwYWluU2VydmljZS5nZXRUaW1lKClcclxuICAgICAgLnN1YnNjcmliZSgodGltZTogYW55KSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lc3RhbXAgPSBuZXcgRGF0ZSh0aW1lLmZ1bGxkYXRlKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgdGhpcy5fbWFwUmVmLnJlbW92ZU1hcmtlcnMoKTtcclxuXHJcbiAgICAgICAgY29uc3QgZHJhd25Sb3V0ZVRvUmVtb3ZlOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwb2ludHMpIHtcclxuICAgICAgICAgIGNvbnN0IG1hcmtlck5vRXhpc3QgPSB0aGlzLl9kcmF3blJvdXRlcy5pbmRleE9mKGtleSkgPT09IC0xO1xyXG4gICAgICAgICAgaWYgKCBtYXJrZXJOb0V4aXN0ICkge1xyXG4gICAgICAgICAgICBkcmF3blJvdXRlVG9SZW1vdmUucHVzaChrZXkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICB0aGlzLnNldE1hcmtlcihcclxuICAgICAgICAgICAgcG9pbnRzW2tleV0ubGF0LCBcclxuICAgICAgICAgICAgcG9pbnRzW2tleV0ubG9uZywgXHJcbiAgICAgICAgICAgIGtleSwgXHJcbiAgICAgICAgICAgIFV0aWxzU2VydmljZS5nZXRUaW1lc3RhbXBzRGlmZXJlbmNlKCBjdXJyZW50VGltZXN0YW1wLCBwb2ludHNba2V5XS50aW1lICkgKyAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9tYXBSZWYucmVtb3ZlUG9seWxpbmVzKGRyYXduUm91dGVUb1JlbW92ZSk7XHJcbiAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgY29uc29sZS5kaXIoZXJyKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9pbml0RmlyZWJhc2UoKSB7XHJcblxyXG4gICAgdGhpcy5fYXBhcmNhb1NlcnZpY2UuaW5pdEZpcmViYXNlKCkgXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9hcGFyY2FvU2VydmljZS5saXN0ZW5DaGFuZ2VzKHRoaXMuX3BvaW50c0NoYW5nZS5iaW5kKHRoaXMpKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcG9pbnRzID0gdGhpcy5fcG9pbnRzIHx8IHt9O1xyXG4gICAgICAgICAgICAgIHRoaXMuX2RyYXdQb2ludHModGhpcy5fcG9pbnRzKTtcclxuICAgICAgICAgICAgfSwgOTAwMDApO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qIGZpcmViYXNlLmFkZFZhbHVlRXZlbnRMaXN0ZW5lcih0aGlzLl9wb2ludHNDaGFuZ2UuYmluZCh0aGlzKSwgXCIvcG9pbnRzL0FuZGFsdWNpYS9TZXZpbGxhXCIpICovXHJcbiAgICAgICAgLyogLnRoZW4oXHJcbiAgICAgICAgICAobGlzdGVuZXJXcmFwcGVyKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBwYXRoID0gbGlzdGVuZXJXcmFwcGVyLnBhdGg7XHJcbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSBsaXN0ZW5lcldyYXBwZXIubGlzdGVuZXJzOyAvLyBhbiBBcnJheSBvZiBsaXN0ZW5lcnMgYWRkZWRcclxuICAgICAgICAgICAgLy8geW91IGNhbiBzdG9yZSB0aGUgd3JhcHBlciBzb21ld2hlcmUgdG8gbGF0ZXIgY2FsbCAncmVtb3ZlRXZlbnRMaXN0ZW5lcnMnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKTsgKi9cclxuXHJcbiAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgZGlhbG9ncy5hbGVydCh7XHJcbiAgICAgICAgICB0aXRsZTogXCJcIixcclxuICAgICAgICAgIG1lc3NhZ2U6IFwiRXJyb3IgZW4gbGEgY2FyZ2EgaW5pY2lhbCBkZSBkYXRvcy5cIixcclxuICAgICAgICAgIG9rQnV0dG9uVGV4dDogXCJSZWludGVudGFyXCIsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLl9pbml0RmlyZWJhc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7IFxyXG4gIH1cclxuICAgIFxyXG4gIHByaXZhdGUgX2NoZWNrTG9jYXRpb24oc3VjY2Vzcyl7XHJcbiAgICBcclxuICAgIHRoaXMuX21hcFJlZi5nZXRVc2VyTG9jYXRpb24oKVxyXG4gICAgICAudGhlbiggKHVzZXJMb2NhdGlvbjogVXNlckxvY2F0aW9uKSA9PiB7XHJcbiAgICAgICAgc3VjY2VzcygpO1xyXG4gICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgIGRpYWxvZ3MuY29uZmlybSh7XHJcbiAgICAgICAgICB0aXRsZTogXCJcIixcclxuICAgICAgICAgIG1lc3NhZ2U6IFwiTmVjZXNpdGFzIGFjdGl2YXIgZWwgR1BTIHBhcmEgcmVhbGl6YXIgZXN0YSBhY2Npw7NuLlwiLFxyXG4gICAgICAgICAgb2tCdXR0b25UZXh0OiBcIkFjdGl2YXJcIixcclxuICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6IFwiTm8gYWN0aXZhclwiXHJcbiAgICAgICAgfSkudGhlbihhY3RpdmFyID0+IHtcclxuXHJcbiAgICAgICAgICBpZiAoICFhY3RpdmFyICkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgICBlbmFibGVMb2NhdGlvblJlcXVlc3QoKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc3VjY2VzcygpO1xyXG4gICAgICAgICAgICB9LCAoZSkgPT4geyBcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIChlLm1lc3NhZ2UgfHwgZSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfZ2V0Q29tdW5pZGFkZXNBdXRvbm9tYXMoKSB7XHJcbiAgICBcclxuICAgIHRvYXN0Lm1ha2VUZXh0KCdDYXJnYW5kbyBjb211bmlkYWRlcy4uLicpLnNob3coKTtcclxuXHJcbiAgICB0aGlzLl9zcGFpblNlcnZpY2UuZ2V0Q29tdW5pZGFkZXNBdXRvbm9tYXMoKVxyXG4gICAgICAuc3Vic2NyaWJlKCAoY29tdW5pZGFkZXM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgIGRpYWxvZ3MuYWN0aW9uKHtcclxuICAgICAgICAgICAgICBtZXNzYWdlOiBcIsK/RW4gcXXDqSBjb211bmlkYWQgZXN0w6FzP1wiLFxyXG4gICAgICAgICAgICAgIGFjdGlvbnM6IGNvbXVuaWRhZGVzXHJcbiAgICAgICAgICB9KS50aGVuKHJlc3VsdCA9PiB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhdXQgPSBVdGlsc1NlcnZpY2UudHJhbnNmb3JtUmVnaW9uTmFtZShyZXN1bHQpO1xyXG4gICAgICAgICAgICB0b2FzdC5tYWtlVGV4dCgnQ2FyZ2FuZG8gcHJvdmluY2lhcy4uLicpLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3NwYWluU2VydmljZS5nZXRQcm92aW5jaWFzKGF1dClcclxuICAgICAgICAgICAgLnN1YnNjcmliZSgocHJvdmluY2lhczphbnkpID0+IHtcclxuICAgICAgICAgICAgICBkaWFsb2dzLmFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIsK/RW4gcXXDqSBwcm92aW5jaWEgZXN0w6FzP1wiLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uczogcHJvdmluY2lhc1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBybyA9IFV0aWxzU2VydmljZS50cmFuc2Zvcm1SZWdpb25OYW1lKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5zZXRTdHJpbmcoXCJhdXRvbm9taWFcIiwgYXV0KTtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzLnNldFN0cmluZyhcInByb3ZpbmNpYVwiLCBwcm8pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdEZpcmViYXNlKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgIH0pO1xyXG4gIH1cclxuICAgIFxyXG59XHJcbiJdfQ==