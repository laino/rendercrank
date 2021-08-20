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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
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
import { Resource, ResourceRef } from '../core';
var PREAMBLE = "#version 300 es\nprecision highp float;\n";
var ProgramRef = /** @class */ (function (_super) {
    __extends(ProgramRef, _super);
    function ProgramRef(def) {
        var _this = _super.call(this, Program) || this;
        _this.def = def;
        return _this;
    }
    ProgramRef.prototype.writeData = function (protocol) {
        protocol.writeString(JSON.stringify(this.def));
    };
    return ProgramRef;
}(ResourceRef));
export { ProgramRef };
var Program = /** @class */ (function (_super) {
    __extends(Program, _super);
    function Program() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Program.prototype.load = function (protocol) {
        var def = JSON.parse(protocol.readString());
        var gl = this.renderer.gl;
        var attributes = def.attributes || {};
        var uniforms = def.uniforms || {};
        var vertexShaderSource = createVertexShaderCode(def.vertexShader, attributes, uniforms);
        var fragmentShaderSource = createFragmentShaderCode(def.fragmentShader, uniforms);
        var vertexShader = this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(vertexShader));
        }
        var fragmentShader = this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(fragmentShader));
        }
        var program = this.program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program));
        }
        this.attributes = Object.entries(attributes).map(function (_a) {
            var _b = __read(_a, 2), name = _b[0], type = _b[1];
            return {
                name: name,
                type: type,
                location: gl.getAttribLocation(program, name)
            };
        });
        this.uniforms = Object.entries(uniforms).map(function (_a) {
            var _b = __read(_a, 2), name = _b[0], type = _b[1];
            return {
                name: name,
                type: type,
                location: gl.getUniformLocation(program, name)
            };
        });
    };
    Program.prototype.update = function () {
        // noop
    };
    Program.prototype.unload = function () {
        var gl = this.renderer.gl;
        gl.deleteProgram(this.program);
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);
        this.program = void 0;
        this.vertexShader = void 0;
        this.fragmentShader = void 0;
    };
    Program.resourceName = 'Program';
    return Program;
}(Resource));
export { Program };
function createVertexShaderCode(body, attributes, uniforms) {
    return (PREAMBLE +
        createAttributes(attributes) +
        createUniforms(uniforms) +
        fixIndent(body));
}
function createFragmentShaderCode(body, uniforms) {
    return (PREAMBLE +
        createUniforms(uniforms) +
        fixIndent(body));
}
function createAttributes(attributes) {
    return Object.entries(attributes)
        .map(function (_) { return "in " + _[1] + " " + _[0] + ";"; })
        .join('\n') + '\n';
}
function createUniforms(uniforms) {
    return Object.entries(uniforms)
        .map(function (_) { return "uniform " + _[1] + " " + _[0] + ";"; })
        .join('\n') + '\n';
}
var firstCharRegExp = /[^ \t]/;
function fixIndent(body) {
    var e_1, _a;
    var lines = body.split('\n');
    var minIndent = Infinity;
    try {
        for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
            var line = lines_1_1.value;
            var match = line.match(firstCharRegExp);
            var lineStart = match ? match.index : line.length;
            minIndent = Math.min(minIndent, lineStart);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return lines.map(function (line) {
        return line.slice(minIndent);
    }).join('\n');
}
//# sourceMappingURL=program.js.map