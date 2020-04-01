import { window, document, location } from 'global';
import * as EVENTS from '@storybook/core-events';
import Channel, { ChannelEvent, ChannelHandler } from '@storybook/channels';
import { logger, pretty } from '@storybook/client-logger';
import { isJSON, parse, stringify } from 'telejson';

interface Config {
  page: 'manager' | 'preview';
}

interface BufferedEvent {
  event: ChannelEvent;
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

export const KEY = 'storybook-channel';

// TODO: we should export a method for opening child windows here and keep track of em.
// that way we can send postMessage to child windows as well, not just iframe
// https://stackoverflow.com/questions/6340160/how-to-get-the-references-of-all-already-opened-child-windows

export class PostmsgTransport {
  private buffer: BufferedEvent[];

  private handler: ChannelHandler;

  private connected: boolean;

  constructor(private readonly config: Config) {
    this.buffer = [];
    this.handler = null;
    window.addEventListener('message', this.handleEvent.bind(this), false);

    // Check whether the config.page parameter has a valid value
    if (config.page !== 'manager' && config.page !== 'preview') {
      throw new Error(`postmsg-channel: "config.page" cannot be "${config.page}"`);
    }
  }

  setHandler(handler: ChannelHandler): void {
    this.handler = (...args) => {
      handler.apply(this, args);

      if (!this.connected && this.getLocalFrame().length) {
        this.flush();
        this.connected = true;
      }
    };
  }

  /**
   * Sends `event` to the associated window. If the window does not yet exist
   * the event will be stored in a buffer and sent when the window exists.
   * @param event
   */
  send(event: ChannelEvent, options?: any): Promise<any> {
    let depth = 15;
    let allowFunction = true;
    let target;

    if (options && typeof options.allowFunction === 'boolean') {
      allowFunction = options.allowFunction;
    }
    if (options && Number.isInteger(options.depth)) {
      depth = options.depth;
    }
    if (options && typeof options.target === 'string') {
      target = options.target;
    }

    const frames = this.getFrames(target);

    const data = stringify(
      { key: KEY, event, source: document.location.origin + document.location.pathname },
      { maxDepth: depth, allowFunction }
    );

    if (!frames.length) {
      return new Promise((resolve, reject) => {
        this.buffer.push({ event, resolve, reject });
      });
    }
    if (this.buffer.length) {
      this.flush();
    }

    frames.forEach((f) => {
      try {
        f.postMessage(data, '*');
      } catch (e) {
        console.error('sending over postmessage fail');
      }
    });

    return Promise.resolve(null);
  }

  private flush(): void {
    const { buffer } = this;
    this.buffer = [];
    buffer.forEach((item) => {
      this.send(item.event).then(item.resolve).catch(item.reject);
    });
  }

  private getFrames(target?: string): Window[] {
    if (this.config.page === 'manager') {
      const nodes: HTMLIFrameElement[] = [
        ...document.querySelectorAll('iframe[data-is-storybook][data-is-loaded]'),
      ];

      const list = nodes
        .filter((e) => {
          try {
            return !!e.contentWindow && e.dataset.isStorybook !== undefined && e.id === target;
          } catch (er) {
            return false;
          }
        })
        .map((e) => e.contentWindow);

      return list.length ? list : this.getCurrentFrames();
    }
    if (window && window.parent) {
      return [window.parent];
    }

    return [];
  }

  private getCurrentFrames(): Window[] {
    if (this.config.page === 'manager') {
      const list: HTMLIFrameElement[] = [
        ...document.querySelectorAll('[data-is-storybook="true"]'),
      ];
      return list.map((e) => e.contentWindow);
    }
    if (window && window.parent) {
      return [window.parent];
    }

    return [];
  }

  private getLocalFrame(): Window[] {
    if (this.config.page === 'manager') {
      const list: HTMLIFrameElement[] = [...document.querySelectorAll('#storybook-preview-iframe')];
      return list.map((e) => e.contentWindow);
    }
    if (window && window.parent) {
      return [window.parent];
    }

    return [];
  }

  private handleEvent(rawEvent: MessageEvent): void {
    try {
      const { data } = rawEvent;
      const { key, event, source } = typeof data === 'string' && isJSON(data) ? parse(data) : data;

      if (key === KEY) {
        const pageString =
          this.config.page === 'manager'
            ? `<span style="color: #37D5D3; background: black"> manager </span>`
            : `<span style="color: #1EA7FD; background: black"> preview </span>`;

        const eventString = Object.values(EVENTS).includes(event.type)
          ? `<span style="color: #FF4785">${event.type}</span>`
          : `<span style="color: #FFAE00">${event.type}</span>`;

        event.source = source || getEventSourceUrl(rawEvent);

        if (!event.source) {
          logger.error(
            `${pageString} received ${eventString} but was unable to determine the source of the event`
          );

          return;
        }
        pretty.debug(
          location.origin !== event.source
            ? `${pageString} received ${eventString}`
            : `${pageString} received ${eventString} <span style="color: gray">(on ${location.origin} from ${event.source})</span>`,
          ...event.args
        );

        this.handler(event);
      }
    } catch (error) {
      logger.error(error);
    }
  }
}

const getEventSourceUrl = (event: MessageEvent) => {
  const frames: HTMLIFrameElement[] = [...document.getElementsByTagName('iframe')];

  // try to find the originating iframe by matching it's contentWindow
  // This might not be cross-origin safe
  const [frame, ...remainder] = frames.filter((element) => {
    try {
      return element.contentWindow === event.source;
    } catch (err) {
      // continue
    }

    const src = element.getAttribute('src');
    let origin;

    try {
      ({ origin } = new URL(src, document.location));
    } catch (err) {
      return false;
    }
    return origin === event.origin;
  });

  // If we found multiple matches, there's going to be trouble
  if (remainder.length) {
    console.error('unable to locate origin of postmessage');
    return null;
  }

  const src = frame.getAttribute('src');
  const { origin, pathname } = new URL(src, document.location);
  return origin + pathname;
};

/**
 * Creates a channel which communicates with an iframe or child window.
 */
export default function createChannel({ page }: Config): Channel {
  const transport = new PostmsgTransport({ page });
  return new Channel({ transport });
}
