"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcContext = void 0;
var basehttpcontext_1 = require("./basehttpcontext");
var RpcContext = /** @class */ (function (_super) {
    __extends(RpcContext, _super);
    function RpcContext(context, input) {
        var _this = _super.call(this, context) || this;
        _this.input = input;
        return _this;
    }
    return RpcContext;
}(basehttpcontext_1.BaseHttpContext));
exports.RpcContext = RpcContext;
