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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { ResourceState } from './resource';
import { COMMAND_MAP } from './command';
export var Instruction;
(function (Instruction) {
    Instruction[Instruction["STOP"] = 0] = "STOP";
    Instruction[Instruction["RUN_COMMAND"] = 1] = "RUN_COMMAND";
    Instruction[Instruction["MAP_COMMAND"] = 2] = "MAP_COMMAND";
    Instruction[Instruction["UPDATE_RESOURCE"] = 3] = "UPDATE_RESOURCE";
    Instruction[Instruction["LOAD_RESOURCE"] = 4] = "LOAD_RESOURCE";
    Instruction[Instruction["UNLOAD_RESOURCE"] = 5] = "UNLOAD_RESOURCE";
    Instruction[Instruction["ADVANCE"] = 6] = "ADVANCE";
})(Instruction || (Instruction = {}));
var Instructor = /** @class */ (function () {
    function Instructor(protocol) {
        var e_1, _a;
        this.protocol = protocol;
        this.mappedCommands = {};
        this.resources = new Set();
        var index = 0;
        try {
            for (var _b = __values(Object.values(COMMAND_MAP)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var command = _c.value;
                protocol.writeUInt8(Instruction.MAP_COMMAND);
                protocol.writeUInt8(index);
                protocol.writeString(command.name);
                this.mappedCommands[command.name] = index;
                index++;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.commandProtocol = protocol.createWriter();
    }
    Instructor.prototype.command = function (command) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var commandProtocol = this.commandProtocol;
        commandProtocol.writeUInt8(Instruction.RUN_COMMAND);
        command.submit.apply(command, __spreadArray([this, commandProtocol], __read(args)));
    };
    Instructor.prototype.finish = function () {
        var e_2, _a;
        this.commandProtocol.writeUInt8(Instruction.STOP);
        var commandData = this.commandProtocol.flush();
        var protocol = this.protocol;
        protocol.writeUInt8(Instruction.ADVANCE);
        protocol.advance();
        try {
            for (var commandData_1 = __values(commandData), commandData_1_1 = commandData_1.next(); !commandData_1_1.done; commandData_1_1 = commandData_1.next()) {
                var data = commandData_1_1.value;
                protocol.passData(data);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (commandData_1_1 && !commandData_1_1.done && (_a = commandData_1.return)) _a.call(commandData_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    Instructor.prototype.loadResource = function (resource) {
        var protocol = this.protocol;
        this.resources.add(resource);
        if (resource.state === ResourceState.LOAD_ABORTED) {
            resource.state = ResourceState.LOADING;
            return;
        }
        if (resource.state === ResourceState.UNLOADED) {
            resource.state = ResourceState.LOADING;
            var result = resource.load();
            if (result) {
                result.then(function () {
                    if (resource.state === ResourceState.LOAD_ABORTED) {
                        resource.onUnload();
                        resource.state = ResourceState.UNLOADED;
                    }
                    else {
                        resource.state = ResourceState.LOADED;
                    }
                });
                return;
            }
            resource.state = ResourceState.LOADED;
        }
        if (resource.state === ResourceState.LOADED) {
            protocol.writeUInt8(Instruction.LOAD_RESOURCE);
            protocol.writeUInt32(resource.id);
            protocol.writeString(resource.type.resourceName);
            resource.writeData(protocol);
            resource.state = ResourceState.READY;
        }
        if (resource.state === ResourceState.READY && resource.needsUpdate) {
            resource.needsUpdate = false;
            protocol.writeUInt8(Instruction.UPDATE_RESOURCE);
            protocol.writeUInt32(resource.id);
            resource.writeUpdate(protocol);
        }
    };
    Instructor.prototype.unloadResource = function (resource) {
        var protocol = this.protocol;
        if (resource.refcount > 0 || resource.state === ResourceState.UNLOADED) {
            return;
        }
        if (resource.state === ResourceState.READY) {
            protocol.writeUInt8(Instruction.UNLOAD_RESOURCE);
            protocol.writeUInt32(resource.id);
        }
        if (resource.state !== ResourceState.LOADING) {
            resource.onUnload();
        }
        resource.state = ResourceState.UNLOADED;
    };
    return Instructor;
}());
export { Instructor };
//# sourceMappingURL=instructor.js.map