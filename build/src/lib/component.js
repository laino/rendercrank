var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { Instructor } from './core';
import { RenderTarget } from './render-target';
import { RenderContext } from './render-context';
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component(fn) {
        var _this = _super.call(this) || this;
        _this.fn = fn;
        _this.renderTarget = new RenderTarget(_this);
        _this.resources = new Set();
        return _this;
    }
    Component.prototype.render = function (protocol) {
        var e_1, _a;
        this.fn(this.renderTarget);
        var instructor = new Instructor(protocol);
        this.renderTarget.submit(instructor);
        try {
            for (var _b = __values(instructor.resources), _c = _b.next(); !_c.done; _c = _b.next()) {
                var resource = _c.value;
                resource.refcount++;
                this.resources.add(resource);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        instructor.finish();
    };
    Component.prototype.unload = function (protocol) {
        var e_2, _a;
        var instructor = new Instructor(protocol);
        try {
            for (var _b = __values(this.resources), _c = _b.next(); !_c.done; _c = _b.next()) {
                var resource = _c.value;
                resource.refcount--;
                instructor.unloadResource(resource);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        instructor.finish();
    };
    return Component;
}(RenderContext));
export { Component };
//# sourceMappingURL=component.js.map