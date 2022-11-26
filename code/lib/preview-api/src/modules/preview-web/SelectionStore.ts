import type { Store_SelectionSpecifier, Store_Selection } from '@storybook/types';

export interface SelectionStore {
  selectionSpecifier: Store_SelectionSpecifier | null;

  selection?: Store_Selection;

  setSelection(selection: Store_Selection): void;

  setQueryParams(queryParams: qs.ParsedQs): void;
}
