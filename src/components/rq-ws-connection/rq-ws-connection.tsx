import { type ClientMessage, type ClientConnectedMessage, type ClientSubscribedMessage, type WebsocketConnectionOptions, WebsocketConnection } from '@rhiaqey/sdk-ts';
import { Component, Event, Host, h, type EventEmitter, Prop, Method } from '@stencil/core';
import { Subscription, filter, map } from 'rxjs';
import { isWebsocketConnectionOptions } from '../../utils/utils';

@Component({
    tag: 'rq-ws-connection',
})
export class RqWsConnection {
    private $connx: WebsocketConnection;

    private $subscriptions = new Subscription();

    @Prop()
    connection: WebsocketConnectionOptions | WebsocketConnection;

    @Prop()
    snapshot: WebsocketConnectionOptions['snapshot'];

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

    @Event()
    rqSnapshot: EventEmitter<[cid: string, data: unknown]>;

    @Method()
    async getConnection() {
        return this.$connx;
    }

    connectedCallback() {
        if (isWebsocketConnectionOptions(this.connection)) {
            this.$connx = new WebsocketConnection({
                endpoints: this.connection.endpoints,
                apiKey: this.connection.apiKey,
                apiHost: this.connection.apiHost,
                channels: this.connection.channels,
                snapshot: this.connection.snapshot,
                snapshot_size: this.connection.snapshot_size,
                user_id: this.connection.user_id,
                env: this.connection.env || 'prod',
            });
            this.#setupListeners().then(_ => {
                //
            });
            this.$connx.connect();
        } else {
            this.$connx = this.connection;
            this.#setupListeners().then(_ => {
                //
            });
        }
    }

    async #setupListeners() {
        const cid = this.$connx.getId();

        if (this.snapshot) {
            this.$subscriptions.add(
                this.$connx.fetchSnapshot().subscribe(snapshot => {
                    this.rqSnapshot.emit([cid, snapshot]);
                }),
            );
        }

        this.$subscriptions.add(
            this.$connx
                .eventStream()
                .pipe(filter(event => event[0] === 'ready'))
                .subscribe(() => {
                    console.log(`client[${cid}] connection ready`);
                    const channels = this.$connx.getChannels();
                    this.rqReady.emit([cid, channels]);
                }),
        );

        this.$subscriptions.add(
            this.$connx
                .eventStream()
                .pipe(filter(event => event[0] === 'open'))
                .subscribe(() => {
                    console.log(`client[${cid}] connection open`);
                    this.rqOpen.emit([cid]);
                }),
        );

        this.$subscriptions.add(
            this.$connx
                .dataStream<ClientConnectedMessage>()
                .pipe(filter(message => message.is_connected_type()))
                .subscribe(message => {
                    console.log(`client[${cid}] connected`, message.get_value().client_id);
                    this.rqConnected.emit([cid, message.get_value()]);
                }),
        );

        this.$subscriptions.add(
            this.$connx
                .eventStream()
                .pipe(
                    filter(event => event[0] === 'error'),
                    map(event => event[1]),
                )
                .subscribe(error => {
                    console.warn(`client[${cid}] connection error`, error);
                    this.rqError.emit([cid, error as Error]);
                }),
        );

        this.$subscriptions.add(
            this.$connx
                .eventStream()
                .pipe(filter(event => event[0] === 'complete'))
                .subscribe(() => {
                    console.log(`client[${cid}] connection complete`);
                    this.rqComplete.emit([cid]);
                }),
        );

        for (const channel of this.$connx.getChannels()) {
            this.$subscriptions.add(
                this.$connx
                    .channelStream<ClientSubscribedMessage>(channel)
                    .pipe(filter(message => message.is_subscribed_type()))
                    .subscribe(message => {
                        console.log(`client[${cid}] subscribed to channel`, channel);
                        this.rqSubscribed.emit([cid, message.get_value()]);
                    }),
            );

            this.$subscriptions.add(
                this.$connx
                    .channelStream(channel)
                    .pipe(filter(message => message.is_data_type()))
                    .subscribe(message => {
                        this.rqData.emit([cid, message]);
                    }),
            );
        }
    }

    disconnectedCallback() {
        this.$connx.close();
        this.$subscriptions.unsubscribe();
        this.$connx = undefined;
    }

    render() {
        return <Host />;
    }
}
