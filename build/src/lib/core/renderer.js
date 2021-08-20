import { COMMAND_MAP } from './command';
import { RESOURCE_MAP } from './resource';
import { Instruction } from './instructor';
var DEBUG = true;
var CanvasRenderer = /** @class */ (function () {
    function CanvasRenderer(canvas) {
        this.canvas = canvas;
        this.resources = new Map();
        this.gl = canvas.getContext('webgl2');
    }
    CanvasRenderer.prototype.getResource = function (id, type) {
        var resource = this.resources.get(id);
        if (!resource) {
            return null;
        }
        if (DEBUG) {
            if (!(resource instanceof type)) {
                throw new Error("Resource has incorrect type!");
            }
        }
        return resource;
    };
    CanvasRenderer.prototype.render = function (protocol) {
        var resources = this.resources;
        var commandMap = Array(256);
        var action;
        while ((action = protocol.readUInt8()) !== Instruction.STOP) {
            if (action === Instruction.RUN_COMMAND) {
                var id = protocol.readUInt8();
                commandMap[id].render(protocol, this);
                continue;
            }
            if (action === Instruction.MAP_COMMAND) {
                var id = protocol.readUInt8();
                var commandName = protocol.readString();
                var command = COMMAND_MAP[commandName];
                if (!command) {
                    throw new Error("Command " + commandName + " not registered");
                }
                commandMap[id] = command;
                continue;
            }
            if (action === Instruction.UPDATE_RESOURCE) {
                var id = protocol.readUInt32();
                var resource = this.resources.get(id);
                resource.update(protocol);
                continue;
            }
            if (action === Instruction.LOAD_RESOURCE) {
                var id = protocol.readUInt32();
                var name_1 = protocol.readString();
                var resource = new RESOURCE_MAP[name_1](this);
                resources.set(id, resource);
                resource.load(protocol);
                continue;
            }
            if (action === Instruction.UNLOAD_RESOURCE) {
                var id = protocol.readUInt32();
                var resource = this.resources.get(id);
                resource.unload();
                this.resources.delete(id);
                continue;
            }
            if (action === Instruction.ADVANCE) {
                protocol.advance();
                continue;
            }
        }
    };
    return CanvasRenderer;
}());
export { CanvasRenderer };
//# sourceMappingURL=renderer.js.map