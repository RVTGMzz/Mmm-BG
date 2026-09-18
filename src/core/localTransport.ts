export interface LocalTransportMessage<T> {
  from: string;
  to?: string;
  payload: T;
}

export type LocalTransportHandler<T> = (message: LocalTransportMessage<T>) => void;

export interface LocalTransportAdapter<T> {
  readonly endpointId: string;
  send(payload: T, to?: string): void;
  subscribe(handler: LocalTransportHandler<T>): () => void;
  close(): void;
}

export class InMemoryTransportHub<T> {
  private readonly endpoints = new Map<string, Set<LocalTransportHandler<T>>>();

  createEndpoint(endpointId: string): LocalTransportAdapter<T> {
    if (!endpointId.trim()) throw new Error('endpointId is required.');
    if (this.endpoints.has(endpointId)) throw new Error(`Endpoint ${endpointId} already exists.`);

    const handlers = new Set<LocalTransportHandler<T>>();
    this.endpoints.set(endpointId, handlers);
    let closed = false;

    return {
      endpointId,
      send: (payload, to) => {
        if (closed) throw new Error(`Endpoint ${endpointId} is closed.`);
        const message: LocalTransportMessage<T> = { from: endpointId, to, payload };

        for (const [targetId, targetHandlers] of this.endpoints) {
          if (targetId === endpointId) continue;
          if (to && targetId !== to) continue;
          for (const handler of targetHandlers) handler(message);
        }
      },
      subscribe: (handler) => {
        if (closed) throw new Error(`Endpoint ${endpointId} is closed.`);
        handlers.add(handler);
        return () => handlers.delete(handler);
      },
      close: () => {
        if (closed) return;
        closed = true;
        handlers.clear();
        this.endpoints.delete(endpointId);
      },
    };
  }
}

interface BroadcastEnvelope<T> {
  from: string;
  to?: string;
  payload: T;
}

/**
 * Browser-local transport for multi-tab QA. It intentionally does not provide
 * authentication, persistence, reconnect, or internet transport.
 */
export class BroadcastChannelTransport<T> implements LocalTransportAdapter<T> {
  readonly endpointId: string;
  private readonly channel: BroadcastChannel;
  private readonly handlers = new Set<LocalTransportHandler<T>>();
  private closed = false;

  constructor(channelName: string, endpointId: string) {
    if (!channelName.trim()) throw new Error('channelName is required.');
    if (!endpointId.trim()) throw new Error('endpointId is required.');
    if (typeof BroadcastChannel === 'undefined') {
      throw new Error('BroadcastChannel is not available in this runtime.');
    }

    this.endpointId = endpointId;
    this.channel = new BroadcastChannel(channelName);
    this.channel.addEventListener('message', (event: MessageEvent<BroadcastEnvelope<T>>) => {
      if (this.closed) return;
      const message = event.data;
      if (!message || message.from === this.endpointId) return;
      if (message.to && message.to !== this.endpointId) return;
      for (const handler of this.handlers) handler(message);
    });
  }

  send(payload: T, to?: string): void {
    if (this.closed) throw new Error(`Endpoint ${this.endpointId} is closed.`);
    this.channel.postMessage({ from: this.endpointId, to, payload } satisfies BroadcastEnvelope<T>);
  }

  subscribe(handler: LocalTransportHandler<T>): () => void {
    if (this.closed) throw new Error(`Endpoint ${this.endpointId} is closed.`);
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.handlers.clear();
    this.channel.close();
  }
}
