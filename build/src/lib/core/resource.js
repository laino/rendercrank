export var RESOURCE_MAP = {};
export function registerResourceType(resource) {
    var name = resource.resourceName;
    if (name === 'Resource') {
        throw new Error("Resource name can't be \"Resource\".");
    }
    if (Object.prototype.hasOwnProperty.call(RESOURCE_MAP, name)) {
        throw new Error("A resource type with the name " + name + " is already registered.");
    }
    RESOURCE_MAP[name] = resource;
}
export var ResourceState;
(function (ResourceState) {
    ResourceState[ResourceState["UNLOADED"] = 0] = "UNLOADED";
    ResourceState[ResourceState["LOADING"] = 1] = "LOADING";
    ResourceState[ResourceState["LOAD_ABORTED"] = 2] = "LOAD_ABORTED";
    ResourceState[ResourceState["LOADED"] = 3] = "LOADED";
    ResourceState[ResourceState["READY"] = 4] = "READY";
})(ResourceState || (ResourceState = {}));
var RESOURCE_ID_COUNTER = 0;
export var ResourceID;
(function (ResourceID) {
    function nextID() {
        return RESOURCE_ID_COUNTER++;
    }
    ResourceID.nextID = nextID;
})(ResourceID || (ResourceID = {}));
var ResourceRef = /** @class */ (function () {
    function ResourceRef(type) {
        this.type = type;
        this.id = ResourceID.nextID();
        this.state = ResourceState.UNLOADED;
        this.refcount = 0;
        this.needsUpdate = false;
    }
    ResourceRef.prototype.load = function () {
        // overwrite
    };
    ResourceRef.prototype.writeData = function (protocol) {
        // overwrite
    };
    ResourceRef.prototype.writeUpdate = function (protocol) {
        // overwrite
    };
    ResourceRef.prototype.onUnload = function () {
        // overwrite
        this.needsUpdate = false;
    };
    return ResourceRef;
}());
export { ResourceRef };
var Resource = /** @class */ (function () {
    function Resource(renderer) {
        this.renderer = renderer;
    }
    Resource.resourceName = 'Resource';
    return Resource;
}());
export { Resource };
//# sourceMappingURL=resource.js.map