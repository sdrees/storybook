import { v4 as uuidv4 } from 'uuid';
import { addons } from '@storybook/preview-api';
import { EVENT_ID } from '../constants';
import type { ActionDisplay, ActionOptions, HandlerFunction } from '../models';
import { config } from './configureActions';

type SyntheticEvent = any; // import('react').SyntheticEvent;
const findProto = (obj: unknown, callback: (proto: any) => boolean): Function | null => {
  const proto = Object.getPrototypeOf(obj);
  if (!proto || callback(proto)) return proto;
  return findProto(proto, callback);
};
const isReactSyntheticEvent = (e: unknown): e is SyntheticEvent =>
  Boolean(
    typeof e === 'object' &&
      e &&
      findProto(e, (proto) => /^Synthetic(?:Base)?Event$/.test(proto.constructor.name)) &&
      typeof (e as SyntheticEvent).persist === 'function'
  );
const serializeArg = <T>(a: T) => {
  if (isReactSyntheticEvent(a)) {
    const e: SyntheticEvent = Object.create(
      // @ts-expect-error (Converted from ts-ignore)
      a.constructor.prototype,
      Object.getOwnPropertyDescriptors(a)
    );
    e.persist();
    const viewDescriptor = Object.getOwnPropertyDescriptor(e, 'view');
    // don't send the entire window object over.
    const view: unknown = viewDescriptor?.value;
    if (typeof view === 'object' && view?.constructor.name === 'Window') {
      Object.defineProperty(e, 'view', {
        ...viewDescriptor,
        value: Object.create(view.constructor.prototype),
      });
    }
    return e;
  }
  return a;
};

// TODO react native doesn't have the crypto module, we should figure out a better way to generate these ids.
const generateId = () => {
  return typeof crypto === 'object' && typeof crypto.getRandomValues === 'function'
    ? uuidv4()
    : // pseudo random id, example response lo1e7zm4832bkr7yfl7
      Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export function action(name: string, options: ActionOptions = {}): HandlerFunction {
  const actionOptions = {
    ...config,
    ...options,
  };

  const handler = function actionHandler(...args: any[]) {
    // TODO: Enable once codemods are finished
    // if (options.implicit) {
    //   const preview =
    //     '__STORYBOOK_PREVIEW__' in global
    //       ? (global.__STORYBOOK_PREVIEW__ as PreviewWeb<Renderer>)
    //       : undefined;
    //   if (
    //     preview?.storyRenders.some(
    //       (render) => render.phase === 'playing' || render.phase === 'rendering'
    //     )
    //   ) {
    //     console.warn(
    //       'Can not use implicit actions during rendering or playing of a story.'
    //     );
    //   }
    // }

    const channel = addons.getChannel();
    // this makes sure that in js enviroments like react native you can still get an id
    const id = generateId();
    const minDepth = 5; // anything less is really just storybook internals
    const serializedArgs = args.map(serializeArg);
    const normalizedArgs = args.length > 1 ? serializedArgs : serializedArgs[0];

    const actionDisplayToEmit: ActionDisplay = {
      id,
      count: 0,
      data: { name, args: normalizedArgs },
      options: {
        ...actionOptions,
        maxDepth: minDepth + (actionOptions.depth || 3),
        allowFunction: actionOptions.allowFunction || false,
      },
    };
    channel.emit(EVENT_ID, actionDisplayToEmit);
  };
  handler.isAction = true;

  return handler;
}
