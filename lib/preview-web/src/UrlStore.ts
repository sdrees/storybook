import type { SelectionSpecifier, Selection } from '@storybook/store';

import global from 'global';
import qs from 'qs';
import deprecate from 'util-deprecate';
import type { ViewMode } from '@storybook/addons';

import { parseArgsParam } from './parseArgsParam';

const { history, document } = global;

export function pathToId(path: string) {
  const match = (path || '').match(/^\/story\/(.+)/);
  if (!match) {
    throw new Error(`Invalid path '${path}',  must start with '/story/'`);
  }
  return match[1];
}

const getQueryString = ({
  selection,
  extraParams,
}: {
  selection?: Selection;
  extraParams?: qs.ParsedQs;
}) => {
  const { search = '' } = document.location;
  const { path, selectedKind, selectedStory, ...rest } = qs.parse(search, {
    ignoreQueryPrefix: true,
  });
  return qs.stringify(
    {
      ...rest,
      ...extraParams,
      ...(selection && { id: selection.storyId, viewMode: selection.viewMode }),
    },
    { encode: false, addQueryPrefix: true }
  );
};

export const setPath = (selection?: Selection) => {
  if (!selection) return;
  const query = getQueryString({ selection });
  const { hash = '' } = document.location;
  document.title = selection.storyId;
  history.replaceState({}, '', `${document.location.pathname}${query}${hash}`);
};

type ValueOf<T> = T[keyof T];
const isObject = (val: Record<string, any>) =>
  val != null && typeof val === 'object' && Array.isArray(val) === false;

const getFirstString = (v: ValueOf<qs.ParsedQs>): string | void => {
  if (typeof v === 'string') {
    return v;
  }
  if (Array.isArray(v)) {
    return getFirstString(v[0]);
  }
  if (isObject(v)) {
    // @ts-ignore
    return getFirstString(Object.values(v));
  }
  return undefined;
};

const deprecatedLegacyQuery = deprecate(
  () => 0,
  `URL formats with \`selectedKind\` and \`selectedName\` query parameters are deprecated.
Use \`id=$storyId\` instead.
See https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#new-url-structure`
);

export const getSelectionSpecifierFromPath: () => SelectionSpecifier = () => {
  const query = qs.parse(document.location.search, { ignoreQueryPrefix: true });
  const args = typeof query.args === 'string' ? parseArgsParam(query.args) : undefined;
  const globals = typeof query.globals === 'string' ? parseArgsParam(query.globals) : undefined;

  let viewMode = getFirstString(query.viewMode) as ViewMode;
  if (typeof viewMode !== 'string' || !viewMode.match(/docs|story/)) {
    viewMode = 'story';
  }

  const path = getFirstString(query.path);
  const storyId = path ? pathToId(path) : getFirstString(query.id);

  if (storyId) {
    return { storySpecifier: storyId, args, globals, viewMode };
  }

  // Legacy URL format
  const title = getFirstString(query.selectedKind);
  const name = getFirstString(query.selectedStory);

  if (title && name) {
    deprecatedLegacyQuery();
    return { storySpecifier: { title, name }, args, globals, viewMode };
  }
  return null;
};

export class UrlStore {
  selectionSpecifier: SelectionSpecifier;

  selection: Selection;

  constructor() {
    this.selectionSpecifier = getSelectionSpecifierFromPath();
  }

  setSelection(selection: Selection) {
    this.selection = selection;
    setPath(this.selection);
  }

  setQueryParams(queryParams: qs.ParsedQs) {
    const query = getQueryString({ extraParams: queryParams });
    const { hash = '' } = document.location;
    history.replaceState({}, '', `${document.location.pathname}${query}${hash}`);
  }
}
