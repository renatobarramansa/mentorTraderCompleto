"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiaryController = void 0;
const common_1 = require("@nestjs/common");
const diary_service_1 = require("./diary.service");
const diary_dto_1 = require("./dto/diary.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DiaryController = class DiaryController {
    constructor(diaryService) {
        this.diaryService = diaryService;
    }
    create(req, createDiaryDto) {
        return this.diaryService.create(req.user.id, createDiaryDto);
    }
    findAll(req, startDate, endDate, pair, direction) {
        const filters = {};
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        if (pair)
            filters.pair = pair;
        if (direction)
            filters.direction = direction;
        return this.diaryService.findAll(req.user.id, filters);
    }
    getStats(req) {
        return this.diaryService.getStats(req.user.id);
    }
    getMonthlySummary(req, year, month) {
        return this.diaryService.getMonthlySummary(req.user.id, year, month);
    }
    findOne(req, id) {
        return this.diaryService.findOne(req.user.id, id);
    }
    update(req, id, updateDiaryDto) {
        return this.diaryService.update(req.user.id, id, updateDiaryDto);
    }
    remove(req, id) {
        return this.diaryService.remove(req.user.id, id);
    }
};
exports.DiaryController = DiaryController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, diary_dto_1.CreateDiaryDto]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('pair')),
    __param(4, (0, common_1.Query)('direction')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('monthly'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "getMonthlySummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, diary_dto_1.UpdateDiaryDto]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "remove", null);
exports.DiaryController = DiaryController = __decorate([
    (0, common_1.Controller)('diary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [diary_service_1.DiaryService])
], DiaryController);
//# sourceMappingURL=diary.controller.js.map