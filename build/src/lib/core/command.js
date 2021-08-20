export var COMMAND_MAP = {};
export function Command(def) {
    if (Object.prototype.hasOwnProperty.call(COMMAND_MAP, def.name)) {
        throw new Error("A command with the name " + def.name + " is already registered.");
    }
    COMMAND_MAP[def.name] = def;
    return def;
}
//# sourceMappingURL=command.js.map