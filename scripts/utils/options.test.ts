import { createCommand } from 'commander';
import { describe, it, expect } from '@jest/globals';

import {
  getOptions,
  areOptionsSatisfied,
  getCommand,
  OptionValues,
  MaybeOptionValues,
} from './options';

const allOptions = {
  first: {
    description: 'first',
  },
  second: {
    description: 'second',
    inverse: true,
  },
  third: {
    description: 'third',
    values: ['one', 'two', 'three'],
    required: true as const,
  },
  fourth: {
    description: 'fourth',
    values: ['a', 'b', 'c'],
    multiple: true as const,
  },
};

// TS "tests"
// deepscan-disable-next-line
function test(mv: MaybeOptionValues<typeof allOptions>, v: OptionValues<typeof allOptions>) {
  console.log(mv.first, mv.second, mv.third, mv.fourth);
  // @ts-expect-error as it's not allowed
  console.log(mv.fifth);
  console.log(v.first, v.second, v.third, v.fourth);
  // @ts-expect-error as it's not allowed
  console.log(v.fifth);
}

describe('getOptions', () => {
  it('deals with boolean options', () => {
    expect(getOptions(createCommand(), allOptions, ['command', 'name', '--first'])).toMatchObject({
      first: true,
      second: true,
    });
  });

  it('deals with inverse boolean options', () => {
    expect(
      getOptions(createCommand(), allOptions, ['command', 'name', '--no-second'])
    ).toMatchObject({
      first: false,
      second: false,
    });
  });

  it('deals with short options', () => {
    expect(getOptions(createCommand(), allOptions, ['command', 'name', '-f', '-S'])).toMatchObject({
      first: true,
      second: false,
    });
  });

  it('deals with string options', () => {
    const r = getOptions(createCommand(), allOptions, ['command', 'name', '--third', 'one']);
    expect(
      getOptions(createCommand(), allOptions, ['command', 'name', '--third', 'one'])
    ).toMatchObject({
      third: 'one',
    });
  });

  it('disallows invalid string options', () => {
    expect(() =>
      getOptions(createCommand(), allOptions, ['command', 'name', '--third', 'random'])
    ).toThrow(/Unexpected value/);
  });

  it('deals with multiple string options', () => {
    expect(
      getOptions(createCommand(), allOptions, ['command', 'name', '--fourth', 'a'])
    ).toMatchObject({
      fourth: ['a'],
    });

    expect(
      getOptions(createCommand(), allOptions, ['command', 'name', '--fourth', 'a', '--fourth', 'b'])
    ).toMatchObject({
      fourth: ['a', 'b'],
    });
  });

  it('disallows invalid multiple string options', () => {
    expect(() =>
      getOptions(createCommand(), allOptions, ['command', 'name', '--fourth', 'random'])
    ).toThrow(/Unexpected value/);
  });
});

describe('areOptionsSatisfied', () => {
  it('checks each required string option has a value', () => {
    expect(
      areOptionsSatisfied(allOptions, {
        first: true,
        second: true,
        third: undefined,
        fourth: ['a', 'c'],
      })
    ).toBe(false);
    expect(
      areOptionsSatisfied(allOptions, {
        first: true,
        second: true,
        third: 'one',
        fourth: [],
      })
    ).toBe(true);
  });
});

describe('getCommand', () => {
  const { first, second, third, fourth } = allOptions;
  it('works with boolean options', () => {
    expect(getCommand('node foo', { first, second }, { first: true, second: true })).toBe(
      'node foo --first'
    );
  });

  it('works with inverse boolean options', () => {
    expect(getCommand('node foo', { first, second }, { first: false, second: false })).toBe(
      'node foo --no-second'
    );
  });

  it('works with string options', () => {
    expect(getCommand('node foo', { third }, { third: 'one' })).toBe('node foo --third one');
  });

  it('works with multiple string options', () => {
    expect(getCommand('node foo', { fourth }, { fourth: ['a', 'b'] })).toBe(
      'node foo --fourth a --fourth b'
    );
  });

  // This is for convenience
  it('works with partial options', () => {
    expect(getCommand('node foo', allOptions, { third: 'one' })).toBe(
      'node foo --no-second --third one'
    );
  });

  it('works with combinations string options', () => {
    expect(
      getCommand('node foo', allOptions, {
        first: true,
        second: false,
        third: 'one',
        fourth: ['a', 'b'],
      })
    ).toBe('node foo --first --no-second --third one --fourth a --fourth b');
  });
});
