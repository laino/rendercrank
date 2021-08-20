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
import { Command } from '../core';
import { Program, Buffer } from '../resources';
export var RunProgram = Command({
    name: 'RunProgram',
    submit: function (instructor, protocol, options) {
        var program = options.program, buffer = options.buffer, offset = options.offset, length = options.length;
        instructor.loadResource(program);
        instructor.loadResource(buffer);
        protocol.writeUInt32Array([program.id, buffer.id, offset, length]);
    },
    render: function (protocol, renderer) {
        var _a = __read(protocol.readUInt32Array(4), 4), programId = _a[0], bufferId = _a[1], offset = _a[2], length = _a[3];
        var program = renderer.getResource(programId, Program);
        var buffer = renderer.getResource(bufferId, Buffer);
        console.log(program, buffer);
        if (!program || !buffer) {
            return;
        }
    }
});
//# sourceMappingURL=run-program.js.map