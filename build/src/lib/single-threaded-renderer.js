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
import { ArrayBufferProtocolWriter, ArrayBufferProtocolReader, CanvasRenderer } from './core';
/*
 * Utility class to easily setup single threaded rendering.
 */
var SingleThreadedCanvasRenderer = /** @class */ (function (_super) {
    __extends(SingleThreadedCanvasRenderer, _super);
    function SingleThreadedCanvasRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.protocolWriter = new ArrayBufferProtocolWriter(true);
        _this.protocolReader = new ArrayBufferProtocolReader(true);
        return _this;
    }
    SingleThreadedCanvasRenderer.prototype.renderComponent = function (component) {
        component.render(this.protocolWriter);
        var data = this.protocolWriter.flush();
        this.protocolReader.receive(data);
        this.render(this.protocolReader);
    };
    SingleThreadedCanvasRenderer.prototype.unloadComponent = function (component) {
        component.unload(this.protocolWriter);
        var data = this.protocolWriter.flush();
        this.protocolReader.receive(data);
        this.render(this.protocolReader);
    };
    return SingleThreadedCanvasRenderer;
}(CanvasRenderer));
export { SingleThreadedCanvasRenderer };
//# sourceMappingURL=single-threaded-renderer.js.map