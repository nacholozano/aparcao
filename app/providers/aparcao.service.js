"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var firebase = require("nativescript-plugin-firebase");
var settings = require("application-settings");
var AparcaoService = /** @class */ (function () {
    function AparcaoService() {
    }
    AparcaoService.prototype.initFirebase = function () {
        return firebase.init({
            persist: false
        });
    };
    AparcaoService.prototype.getPoints = function () {
        return firebase.getValue(this._getPathDb());
    };
    AparcaoService.prototype.addPoint = function (lat, long) {
        return firebase.push(this._getPathDb(), {
            lat: lat,
            long: long,
            time: firebase.ServerValue.TIMESTAMP
        });
    };
    AparcaoService.prototype.removePoint = function (point) {
        return firebase.update(this._getPathDb(), point);
    };
    AparcaoService.prototype.listenChanges = function (fn) {
        return firebase.addValueEventListener(fn, this._getPathDb());
    };
    AparcaoService.prototype._getPathDb = function () {
        return '/points/' + settings.getString("autonomia") + '/' + settings.getString("provincia");
    };
    AparcaoService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], AparcaoService);
    return AparcaoService;
}());
exports.AparcaoService = AparcaoService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBhcmNhby5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBhcmNhby5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQTJDO0FBQzNDLHVEQUF5RDtBQUN6RCwrQ0FBaUQ7QUFHakQ7SUFFRTtJQUNJLENBQUM7SUFFTCxxQ0FBWSxHQUFaO1FBQ0UsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDbkIsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsa0NBQVMsR0FBVDtRQUNFLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxpQ0FBUSxHQUFSLFVBQVMsR0FBb0IsRUFBRSxJQUFxQjtRQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDbEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUNqQjtZQUNFLEdBQUcsRUFBRSxHQUFHO1lBQ1IsSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTO1NBQ3JDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxvQ0FBVyxHQUFYLFVBQVksS0FBYTtRQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDcEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUNqQixLQUFLLENBQ04sQ0FBQztJQUNKLENBQUM7SUFFRCxzQ0FBYSxHQUFiLFVBQWUsRUFBWTtRQUN6QixNQUFNLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUUsQ0FBQztJQUNoRSxDQUFDO0lBRU8sbUNBQVUsR0FBbEI7UUFDRSxNQUFNLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQXRDVSxjQUFjO1FBRDFCLGlCQUFVLEVBQUU7O09BQ0EsY0FBYyxDQXdDMUI7SUFBRCxxQkFBQztDQUFBLEFBeENELElBd0NDO0FBeENZLHdDQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgKiBhcyBmaXJlYmFzZSBmcm9tICduYXRpdmVzY3JpcHQtcGx1Z2luLWZpcmViYXNlJztcclxuaW1wb3J0ICogYXMgc2V0dGluZ3MgZnJvbSAnYXBwbGljYXRpb24tc2V0dGluZ3MnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgQXBhcmNhb1NlcnZpY2Uge1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICApIHsgfVxyXG5cclxuICBpbml0RmlyZWJhc2UoKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBmaXJlYmFzZS5pbml0KHtcclxuICAgICAgcGVyc2lzdDogZmFsc2VcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0UG9pbnRzKCk6IFByb21pc2U8YW55PntcclxuICAgIHJldHVybiBmaXJlYmFzZS5nZXRWYWx1ZSh0aGlzLl9nZXRQYXRoRGIoKSk7XHJcbiAgfVxyXG5cclxuICBhZGRQb2ludChsYXQ6IG51bWJlciB8IHN0cmluZywgbG9uZzogbnVtYmVyIHwgc3RyaW5nKTogUHJvbWlzZTxhbnk+e1xyXG4gICAgcmV0dXJuIGZpcmViYXNlLnB1c2goXHJcbiAgICAgIHRoaXMuX2dldFBhdGhEYigpLFxyXG4gICAgICB7XHJcbiAgICAgICAgbGF0OiBsYXQsXHJcbiAgICAgICAgbG9uZzogbG9uZyxcclxuICAgICAgICB0aW1lOiBmaXJlYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVBcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICByZW1vdmVQb2ludChwb2ludDogT2JqZWN0KTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBmaXJlYmFzZS51cGRhdGUoXHJcbiAgICAgIHRoaXMuX2dldFBhdGhEYigpLFxyXG4gICAgICBwb2ludFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGxpc3RlbkNoYW5nZXMoIGZuOiAoKSA9PiB7fSApOiBQcm9taXNlPGFueT4ge1xyXG4gICAgcmV0dXJuIGZpcmViYXNlLmFkZFZhbHVlRXZlbnRMaXN0ZW5lcihmbiwgdGhpcy5fZ2V0UGF0aERiKCkgKTtcclxuICB9XHJcbiAgXHJcbiAgcHJpdmF0ZSBfZ2V0UGF0aERiKCk6IHN0cmluZ3tcclxuICAgIHJldHVybiAnL3BvaW50cy8nICsgc2V0dGluZ3MuZ2V0U3RyaW5nKFwiYXV0b25vbWlhXCIpICsgJy8nICsgc2V0dGluZ3MuZ2V0U3RyaW5nKFwicHJvdmluY2lhXCIpO1xyXG4gIH1cclxuXHJcbn0iXX0=