import {
  type ClientMessage,
  type ClientConnectedMessage,
  type ClientSubscribedMessage,
  type WebsocketConnectionOptions,
  WebsocketConnection
} from '@rhiaqey/sdk-ts';
import { Component, Event, Host, h, type EventEmitter, Prop, Method } from '@stencil/core';
import { Subscription, filter, map } from 'rxjs';
import { isWebsocketConnectionOptions } from '../../utils/utils';

@Component({
  tag: 'rq-ws-connection'
})
export class RqWsConnection {

  #connection: WebsocketConnection;

  #subscriptions = new Subscription();

  @Prop()
  connection: WebsocketConnectionOptions | WebsocketConnection;

  @Event()
  rqReady: EventEmitter<[cid: string, channels: Set<string>]>;

  @Event()
  rqOpen: EventEmitter<[cid: string]>;

  @Event()
  rqError: EventEmitter<[cid: string, error: Error]>;

  @Event()
  rqComplete: EventEmitter<[cid: string]>;

  @Event()
  rqConnected: EventEmitter<[cid: string, message: ClientConnectedMessage]>;

  @Event()
  rqSubscribed: EventEmitter<[cid: string, message: ClientSubscribedMessage]>;

  @Event()
  rqData: EventEmitter<[cid: string, message: ClientMessage<unknown>]>;

  @Method()
  async getConnection() {
    return this.#connection;
  }

  connectedCallback() {
    if (isWebsocketConnectionOptions(this.connection)) {
      this.#connection = new WebsocketConnection({
        endpoint: this.connection.endpoint,
        apiKey: this.connection.apiKey,
        apiHost: this.connection.apiHost,
        channels: this.connection.channels,
        snapshot: this.connection.snapshot || true,
        env: this.connection.env || 'prod',
      });
    } else {
      this.#connection = this.connection;
    }

    this.#setupListeners();
    this.#connection.connect();
  }

  #setupListeners() {
    const cid = this.#connection.getId();

    this.#subscriptions.add(this.#connection.eventStream().pipe(
      filter(event => event[0] === 'ready'),
    ).subscribe(() => {
      console.log(`client[${cid}] connection ready`);
      const channels = this.#connection.getChannels();
      this.rqReady.emit([cid, channels]);
    }));

    this.#subscriptions.add(this.#connection.eventStream().pipe(
      filter(event => event[0] === 'open'),
    ).subscribe(() => {
      console.log(`client[${cid}] connection open`);
      this.rqOpen.emit([cid]);
    }));

    this.#subscriptions.add(this.#connection.dataStream<ClientConnectedMessage>().pipe(
      filter(message => message.is_connected_type()),
    ).subscribe((message) => {
      console.log(`client[${cid}] connected`, message.get_value().client_id);
      this.rqConnected.emit([cid, message.get_value()]);
    }));

    this.#subscriptions.add(this.#connection.eventStream().pipe(
      filter(event => event[0] === 'error'),
      map(event => event[1])
    ).subscribe((error) => {
      console.warn(`client[${cid}] connection error`, error);
      this.rqError.emit([cid, error as Error]);
    }));

    this.#subscriptions.add(this.#connection.eventStream().pipe(
      filter(event => event[0] === 'complete'),
    ).subscribe(() => {
      console.log(`client[${cid}] connection complete`);
      this.rqComplete.emit([cid]);
    }));

    for (const channel of this.#connection.getChannels()) {
      this.#subscriptions.add(this.#connection.channelStream<ClientSubscribedMessage>(channel).pipe(
        filter(message => message.is_subscribed_type()),
      ).subscribe((message) => {
        console.log(`client[${cid}] subscribed to channel`, channel);
        this.rqSubscribed.emit([cid, message.get_value()]);
      }));

      this.#subscriptions.add(this.#connection.channelStream(channel).pipe(
        filter(message => message.is_data_type()),
      ).subscribe((message) => {
        this.rqData.emit([cid, message]);
      }));
    }
  }

  disconnectedCallback() {
    this.#connection.disconnect();
    this.#subscriptions.unsubscribe();
    this.#connection = undefined;
  }

  render() {
    return (
      <Host />
    );
  }

}
