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
import { RunProgram } from './commands';
import { ColoredTrianglesProgram } from './programs';
var RenderTarget = /** @class */ (function () {
    function RenderTarget(context) {
        this.context = context;
        this.zIndex = 0;
        this.drawCallBatcher = new DrawCallBatcher();
    }
    RenderTarget.prototype.submit = function (instructor) {
        this.drawCallBatcher.submit(instructor);
    };
    RenderTarget.prototype.rect = function (x, y, width, height) {
        var z = this.zIndex++;
        this.triangles([
            x, y, z,
            x + width, y, z,
            x + width, y + height, z,
            x, y, z,
            x + width, y + height, z,
            x, y + height, z,
        ]);
    };
    RenderTarget.prototype.triangles = function (data) {
        this.drawCallBatcher.drawTriangles(this.context, ColoredTrianglesProgram, data);
    };
    return RenderTarget;
}());
export { RenderTarget };
var DrawCallBatcher = /** @class */ (function () {
    function DrawCallBatcher() {
        this.programs = {};
        this.batchedPrograms = [];
    }
    DrawCallBatcher.prototype.drawTriangles = function (context, program, data) {
        var ID = context.id + ":" + program.id;
        var batch = this.programs[ID];
        if (!batch) {
            this.programs[ID] = {
                context: context,
                program: program,
                triangles: [data],
                trianglesLength: data.length
            };
            return;
        }
        batch.triangles.push(data);
        batch.trianglesLength += data.length;
    };
    DrawCallBatcher.prototype.submit = function (instructor) {
        var e_1, _a;
        try {
            for (var _b = __values(Object.values(this.programs)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = _c.value, context = _d.context, program = _d.program, triangles = _d.triangles, trianglesLength = _d.trianglesLength;
                var _e = context.float32BufferPool.writeMultiData(triangles, trianglesLength), buffer = _e.buffer, byteOffset = _e.byteOffset;
                instructor.command(RunProgram, {
                    program: program,
                    buffer: buffer,
                    offset: byteOffset,
                    length: trianglesLength
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return DrawCallBatcher;
}());
export { DrawCallBatcher };
//# sourceMappingURL=render-target.js.map