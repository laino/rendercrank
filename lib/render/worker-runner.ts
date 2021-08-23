import { ArrayBufferProtocolReader, CanvasRunner, RunnerOptions } from '../core';

export * from '../resources';
export * from '../commands';

export type WebworkerRunnerMessage = {
    command: 'setup',
    canvas: OffscreenCanvas,
    options: RunnerOptions
} | {
    command: 'run',
    data: ArrayBuffer[]
};

const protocolReader = new ArrayBufferProtocolReader();

let runner: CanvasRunner;

self.onmessage = (evt: MessageEvent) => {
    const message: WebworkerRunnerMessage = evt.data;

    if (message.command === 'setup') {
        runner = new CanvasRunner(message.canvas, protocolReader, message.options);
    } else if (message.command === 'run') {
        protocolReader.receive(message.data);
        runner.next();
    }
};
