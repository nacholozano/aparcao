"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Replace = /** @class */ (function () {
    function Replace() {
    }
    return Replace;
}());
var UtilsService = /** @class */ (function () {
    function UtilsService() {
    }
    UtilsService.transformRegionName = function (name) {
        var result = name;
        this._replacement.forEach(function (replace) {
            result = result.replace(replace.old, replace.new);
        });
        return result;
    };
    UtilsService.getTimestampsDiference = function (t1, t2) {
        var t = t1 - t2;
        var date = new Date(t);
        var hours = date.getHours() > 0
            ? date.getHours() - 1
            : 0;
        return t <= 0
            ? 0
            : 60 * hours + date.getMinutes();
    };
    UtilsService._replacement = [
        { old: ' ', new: '-' },
        { old: 'ñ', new: 'n' },
        { old: 'á', new: 'a' },
        { old: 'é', new: 'e' },
        { old: 'í', new: 'i' },
        { old: 'ó', new: 'o' },
        { old: 'ú', new: 'u' }
    ];
    return UtilsService;
}());
exports.UtilsService = UtilsService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWxzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtJQUFBO0lBR0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUVEO0lBWUU7SUFBZ0IsQ0FBQztJQUVWLGdDQUFtQixHQUExQixVQUEyQixJQUFZO1FBQ3JDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztRQUVsQixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBRSxVQUFBLE9BQU87WUFDaEMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFFLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxtQ0FBc0IsR0FBN0IsVUFBOEIsRUFBVSxFQUFFLEVBQVU7UUFFbEQsSUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVOLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFqQ2MseUJBQVksR0FBZTtRQUN4QyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtLQUN2QixDQUFBO0lBMkJILG1CQUFDO0NBQUEsQUFyQ0QsSUFxQ0M7QUFyQ1ksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5jbGFzcyBSZXBsYWNlIHtcclxuICBvbGQ6IHN0cmluZztcclxuICBuZXc6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFV0aWxzU2VydmljZSB7XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIF9yZXBsYWNlbWVudDogUmVwbGFjZVtdICA9IFtcclxuICAgIHsgb2xkOiAnICcsIG5ldzogJy0nIH0sXHJcbiAgICB7IG9sZDogJ8OxJywgbmV3OiAnbicgfSxcclxuICAgIHsgb2xkOiAnw6EnLCBuZXc6ICdhJyB9LFxyXG4gICAgeyBvbGQ6ICfDqScsIG5ldzogJ2UnIH0sXHJcbiAgICB7IG9sZDogJ8OtJywgbmV3OiAnaScgfSxcclxuICAgIHsgb2xkOiAnw7MnLCBuZXc6ICdvJyB9LFxyXG4gICAgeyBvbGQ6ICfDuicsIG5ldzogJ3UnIH1cclxuICBdXHJcblxyXG4gIGNvbnN0cnVjdG9yKCkgeyB9XHJcblxyXG4gIHN0YXRpYyB0cmFuc2Zvcm1SZWdpb25OYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBsZXQgcmVzdWx0ID0gbmFtZTtcclxuXHJcbiAgICB0aGlzLl9yZXBsYWNlbWVudC5mb3JFYWNoKCByZXBsYWNlID0+IHtcclxuICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoIHJlcGxhY2Uub2xkLCByZXBsYWNlLm5ldyApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBnZXRUaW1lc3RhbXBzRGlmZXJlbmNlKHQxOiBudW1iZXIsIHQyOiBudW1iZXIpe1xyXG5cclxuICAgIGNvbnN0IHQgPSB0MSAtIHQyO1xyXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHQpO1xyXG4gICAgY29uc3QgaG91cnMgPSBkYXRlLmdldEhvdXJzKCkgPiAwIFxyXG4gICAgICA/IGRhdGUuZ2V0SG91cnMoKSAtIDEgXHJcbiAgICAgIDogMDtcclxuXHJcbiAgICByZXR1cm4gdCA8PSAwIFxyXG4gICAgICA/IDAgXHJcbiAgICAgIDogNjAgKiBob3VycyArIGRhdGUuZ2V0TWludXRlcygpO1xyXG4gIH1cclxuXHJcbn0iXX0=