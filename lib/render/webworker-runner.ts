
import { ArrayBufferProtocolReader, CanvasRunner } from '../core';

export type WebworkerRunnerMessage = {
    command: 'setup',
    canvas: OffscreenCanvas
} | {
    command: 'run',
    data: ArrayBuffer[]
};

const protocolReader = new ArrayBufferProtocolReader();

let runner: CanvasRunner;

self.onmessage = (evt: MessageEvent) => {
    const message: WebworkerRunnerMessage = evt.data;

    if (message.command === 'setup') {
        runner = new CanvasRunner(message.canvas, protocolReader);
    } else if (message.command === 'run') {
        protocolReader.receive(message.data);
        runner.next();
    }
};
