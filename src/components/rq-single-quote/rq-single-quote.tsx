import { Component, Host, h, Prop, Method } from '@stencil/core';
import { ClientConnectedMessage, ClientSubscribedMessage, WebsocketConnection } from '@rhiaqey/sdk-ts';
import { filter, Subscription } from 'rxjs';

@Component({
  tag: 'rq-single-quote',
  styleUrl: 'rq-single-quote.css',
  shadow: true,
})
export class RqSingleQuote {
  private connection: WebsocketConnection;
  private subscriptions = new Subscription();

  @Prop()
  endpoint: string;

  @Prop()
  apiKey: string;

  @Prop()
  apiHost: string;

  @Prop()
  channels: string | string[];

  @Prop()
  symbol?: string;

  @Method()
  async setConnection(conn: WebsocketConnection) {
    if (!this.connection) {
      this.connection = conn;
      this.setupListeners();
    }
  }

  private setupListeners() {
    const channels = typeof this.channels === 'string' ? this.channels.split(',') : this.channels;

    this.subscriptions.add(this.connection.dataStream<ClientConnectedMessage>().pipe(
      filter(message => message.is_connected_type()),
    ).subscribe(message => {
      console.log('client connected', message.get_value());
    }));

    for (const channel of channels) {
      this.subscriptions.add(this.connection.channelStream<ClientSubscribedMessage>(channel).pipe(
        filter(message => message.is_subscribed_type()),
      ).subscribe(message => {
        console.log('client subscribed to channel', channel, message.get_value());
      }));

      this.subscriptions.add(this.connection.channelStream(channel).pipe(
        filter(message => message.is_data_type()),
        // filter(message => message.get_key() === this.symbol),
      ).subscribe(message => {
        console.log('client received data from channel', channel, message);
      }));
    }
  }

  componentDidLoad() {
    this.connection = new WebsocketConnection({
      endpoint: this.endpoint,
      apiKey: this.apiKey,
      apiHost: this.apiHost,
      channels: [].concat(this.channels),
      snapshot: true,
    });

    this.setupListeners();
    this.connection.connect();
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribe();
  }

  render() {
    return (
      <Host>
        <div>hello</div>
      </Host>
    );
  }

}
