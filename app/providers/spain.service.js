"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
require("rxjs/add/operator/map");
var settings = require("application-settings");
var SpainService = /** @class */ (function () {
    function SpainService(_http) {
        this._http = _http;
        this._api = 'http://datos.gob.es/apidata/nti/territory/';
    }
    SpainService.prototype.getComunidadesAutonomas = function () {
        var _this = this;
        return this._http
            .get(this._api + 'Autonomous-region?_sort=label&_pageSize=50&_page=0')
            .map(function (data) {
            return _this._getComunidadesNombre(data.result.items);
        });
    };
    SpainService.prototype.getProvincias = function (autonomia) {
        var _this = this;
        return this._http
            .get(this._api + 'Province?_sort=label&_pageSize=50&_page=0')
            .map(function (data) {
            var comunidad = autonomia || settings.getString("autonomia");
            return _this._getProvinciasNombre(data.result.items, comunidad);
        });
    };
    SpainService.prototype._getComunidadesNombre = function (comunidades) {
        return comunidades
            .map(function (item) { return item.label; });
    };
    SpainService.prototype._getProvinciasNombre = function (provincias, comunidad) {
        return provincias
            .filter(function (item) {
            var autonomiaInfoArray = item.autonomia.split('/');
            return autonomiaInfoArray[autonomiaInfoArray.length - 1] === comunidad;
        })
            .map(function (item) { return item.label; });
    };
    SpainService.prototype.getTime = function () {
        // https://github.com/davidayalas/current-time
        return this._http.get('https://script.google.com/macros/s/AKfycbyd5AcbAnWi2Yn0xhFRbyzS4qMq1VucMVgVvhul5XqS9HkAyJY/exec?tz=Europe/Madrid');
    };
    SpainService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.HttpClient])
    ], SpainService);
    return SpainService;
}());
exports.SpainService = SpainService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhaW4uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNwYWluLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBMkM7QUFDM0MsNkNBQWtEO0FBQ2xELGlDQUErQjtBQUMvQiwrQ0FBaUQ7QUFHakQ7SUFJRSxzQkFDVSxLQUFpQjtRQUFqQixVQUFLLEdBQUwsS0FBSyxDQUFZO1FBSG5CLFNBQUksR0FBRyw0Q0FBNEMsQ0FBQztJQUl4RCxDQUFDO0lBRUwsOENBQXVCLEdBQXZCO1FBQUEsaUJBTUM7UUFMQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUs7YUFDZCxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxvREFBb0QsQ0FBQzthQUNyRSxHQUFHLENBQUUsVUFBQyxJQUFTO1lBQ2QsTUFBTSxDQUFDLEtBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELG9DQUFhLEdBQWIsVUFBYyxTQUFrQjtRQUFoQyxpQkFPQztRQU5DLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSzthQUNkLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLDJDQUEyQyxDQUFDO2FBQzVELEdBQUcsQ0FBRSxVQUFDLElBQVM7WUFDZCxJQUFNLFNBQVMsR0FBRyxTQUFTLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsS0FBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLDRDQUFxQixHQUE3QixVQUErQixXQUFrQjtRQUMvQyxNQUFNLENBQUMsV0FBVzthQUNmLEdBQUcsQ0FBRSxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxLQUFLLEVBQVYsQ0FBVSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLDJDQUFvQixHQUE1QixVQUE4QixVQUFpQixFQUFFLFNBQWlCO1FBQ2hFLE1BQU0sQ0FBQyxVQUFVO2FBQ2QsTUFBTSxDQUFFLFVBQUEsSUFBSTtZQUNYLElBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUM7UUFDdkUsQ0FBQyxDQUFDO2FBQ0QsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLEtBQUssRUFBVixDQUFVLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsOEJBQU8sR0FBUDtRQUNFLDhDQUE4QztRQUM5QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsa0hBQWtILENBQUMsQ0FBQztJQUM1SSxDQUFDO0lBMUNVLFlBQVk7UUFEeEIsaUJBQVUsRUFBRTt5Q0FNTSxpQkFBVTtPQUxoQixZQUFZLENBNEN4QjtJQUFELG1CQUFDO0NBQUEsQUE1Q0QsSUE0Q0M7QUE1Q1ksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCAncnhqcy9hZGQvb3BlcmF0b3IvbWFwJztcclxuaW1wb3J0ICogYXMgc2V0dGluZ3MgZnJvbSAnYXBwbGljYXRpb24tc2V0dGluZ3MnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgU3BhaW5TZXJ2aWNlIHtcclxuXHJcbiAgcHJpdmF0ZSBfYXBpID0gJ2h0dHA6Ly9kYXRvcy5nb2IuZXMvYXBpZGF0YS9udGkvdGVycml0b3J5Lyc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBfaHR0cDogSHR0cENsaWVudFxyXG4gICkgeyB9XHJcblxyXG4gIGdldENvbXVuaWRhZGVzQXV0b25vbWFzKCl7IFxyXG4gICAgcmV0dXJuIHRoaXMuX2h0dHBcclxuICAgICAgLmdldCh0aGlzLl9hcGkgKyAnQXV0b25vbW91cy1yZWdpb24/X3NvcnQ9bGFiZWwmX3BhZ2VTaXplPTUwJl9wYWdlPTAnKVxyXG4gICAgICAubWFwKCAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldENvbXVuaWRhZGVzTm9tYnJlKGRhdGEucmVzdWx0Lml0ZW1zKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldFByb3ZpbmNpYXMoYXV0b25vbWlhPzogc3RyaW5nKXtcclxuICAgIHJldHVybiB0aGlzLl9odHRwXHJcbiAgICAgIC5nZXQodGhpcy5fYXBpICsgJ1Byb3ZpbmNlP19zb3J0PWxhYmVsJl9wYWdlU2l6ZT01MCZfcGFnZT0wJylcclxuICAgICAgLm1hcCggKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbXVuaWRhZCA9IGF1dG9ub21pYSB8fCBzZXR0aW5ncy5nZXRTdHJpbmcoXCJhdXRvbm9taWFcIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3ZpbmNpYXNOb21icmUoZGF0YS5yZXN1bHQuaXRlbXMsIGNvbXVuaWRhZCk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfZ2V0Q29tdW5pZGFkZXNOb21icmUoIGNvbXVuaWRhZGVzOiBhbnlbXSApe1xyXG4gICAgcmV0dXJuIGNvbXVuaWRhZGVzXHJcbiAgICAgIC5tYXAoIGl0ZW0gPT4gaXRlbS5sYWJlbCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9nZXRQcm92aW5jaWFzTm9tYnJlKCBwcm92aW5jaWFzOiBhbnlbXSwgY29tdW5pZGFkOiBzdHJpbmcgKXtcclxuICAgIHJldHVybiBwcm92aW5jaWFzXHJcbiAgICAgIC5maWx0ZXIoIGl0ZW0gPT4ge1xyXG4gICAgICAgIGNvbnN0IGF1dG9ub21pYUluZm9BcnJheSA9IGl0ZW0uYXV0b25vbWlhLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgcmV0dXJuIGF1dG9ub21pYUluZm9BcnJheVthdXRvbm9taWFJbmZvQXJyYXkubGVuZ3RoLTFdID09PSBjb211bmlkYWQ7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5tYXAoaXRlbSA9PiBpdGVtLmxhYmVsKTtcclxuICB9XHJcblxyXG4gIGdldFRpbWUoKXtcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGF5YWxhcy9jdXJyZW50LXRpbWVcclxuICAgIHJldHVybiB0aGlzLl9odHRwLmdldCgnaHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J5ZDVBY2JBbldpMlluMHhoRlJieXpTNHFNcTFWdWNNVmdWdmh1bDVYcVM5SGtBeUpZL2V4ZWM/dHo9RXVyb3BlL01hZHJpZCcpO1xyXG4gIH1cclxuXHJcbn0iXX0=