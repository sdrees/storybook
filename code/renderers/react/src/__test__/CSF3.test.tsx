import React, { KeyboardEventHandler, ReactNode } from 'react';
import { expectTypeOf } from 'expect-type';
import { describe, test } from '@jest/globals';
import { StoryAnnotations } from '@storybook/csf';
import { SetOptional } from 'type-fest';

import { Meta, StoryObj } from '../public-types';
import { DecoratorFn } from '../public-api';
import { satisfies } from './utils';
import { ReactFramework } from '../types';

type ReactStory<Args, RequiredArgs> = StoryAnnotations<ReactFramework, Args, RequiredArgs>;

type ButtonProps = { label: string; disabled: boolean };
const Button: (props: ButtonProps) => JSX.Element = () => <></>;

describe('Args can be provided in multiple ways', () => {
  test('✅ All required args may be provided in meta', () => {
    const meta = satisfies<Meta<typeof Button>>()({
      component: Button,
      args: { label: 'good', disabled: false },
    });

    type Story = StoryObj<typeof meta>;
    const Basic: Story = {};

    expectTypeOf(Basic).toEqualTypeOf<
      ReactStory<ButtonProps, SetOptional<ButtonProps, 'label' | 'disabled'>>
    >();
  });

  test('✅ Required args may be provided partial in meta and the story', () => {
    const meta = satisfies<Meta<typeof Button>>()({
      component: Button,
      args: { label: 'good' },
    });
    const Basic: StoryObj<typeof meta> = {
      args: { disabled: false },
    };

    type Expected = ReactStory<ButtonProps, SetOptional<ButtonProps, 'label'>>;
    expectTypeOf(Basic).toEqualTypeOf<Expected>();
  });

  test('❌ The combined shape of meta args and story args must match the required args.', () => {
    {
      const meta = satisfies<Meta<typeof Button>>()({ component: Button });
      const Basic: StoryObj<typeof meta> = {
        // @ts-expect-error disabled not provided ❌
        args: { label: 'good' },
      };

      type Expected = ReactStory<ButtonProps, ButtonProps>;
      expectTypeOf(Basic).toEqualTypeOf<Expected>();
    }
    {
      const meta = satisfies<Meta<typeof Button>>()({
        component: Button,
        args: { label: 'good' },
      });
      // @ts-expect-error disabled not provided ❌
      const Basic: StoryObj<typeof meta> = {};

      type Expected = ReactStory<ButtonProps, SetOptional<ButtonProps, 'label'>>;
      expectTypeOf(Basic).toEqualTypeOf<Expected>();
    }
    {
      const meta = satisfies<Meta<ButtonProps>>()({ component: Button });
      const Basic: StoryObj<typeof meta> = {
        // @ts-expect-error disabled not provided ❌
        args: { label: 'good' },
      };

      type Expected = ReactStory<ButtonProps, ButtonProps>;
      expectTypeOf(Basic).toEqualTypeOf<Expected>();
    }
  });
});

test('✅ All void functions are optional', () => {
  interface CmpProps {
    label: string;
    disabled: boolean;
    onClick(): void;
    onKeyDown: KeyboardEventHandler;
    onLoading: (s: string) => JSX.Element;
    submitAction(): void;
  }

  const Cmp: (props: CmpProps) => JSX.Element = () => <></>;

  const meta = satisfies<Meta<CmpProps>>()({
    component: Cmp,
    args: { label: 'good' },
  });

  const Basic: StoryObj<typeof meta> = {
    args: { disabled: false, onLoading: () => <div>Loading...</div> },
  };

  type Expected = ReactStory<
    CmpProps,
    SetOptional<CmpProps, 'label' | 'onClick' | 'onKeyDown' | 'submitAction'>
  >;
  expectTypeOf(Basic).toEqualTypeOf<Expected>();
});

type ThemeData = 'light' | 'dark';
declare const Theme: (props: { theme: ThemeData; children?: ReactNode }) => JSX.Element;

describe('Story args can be inferred', () => {
  test('Correct args are inferred when type is widened for render function', () => {
    type Props = ButtonProps & { theme: ThemeData };

    const meta = satisfies<Meta<Props>>()({
      component: Button,
      args: { disabled: false },
      render: (args, { component }) => {
        // component is not null as it is provided in meta
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const Component = component!;
        return (
          <Theme theme={args.theme}>
            <Component {...args} />
          </Theme>
        );
      },
    });

    const Basic: StoryObj<typeof meta> = { args: { theme: 'light', label: 'good' } };

    type Expected = ReactStory<Props, SetOptional<Props, 'disabled'>>;
    expectTypeOf(Basic).toEqualTypeOf<Expected>();
  });

  const withDecorator: DecoratorFn<{ decoratorArg: number }> = (Story, { args }) => (
    <>
      Decorator: {args.decoratorArg}
      <Story args={{ decoratorArg: 0 }} />
    </>
  );

  test('Correct args are inferred when type is widened for decorators', () => {
    type Props = ButtonProps & { decoratorArg: number };

    const meta = satisfies<Meta<Props>>()({
      component: Button,
      args: { disabled: false },
      decorators: [withDecorator],
    });

    const Basic: StoryObj<typeof meta> = { args: { decoratorArg: 0, label: 'good' } };

    type Expected = ReactStory<Props, SetOptional<Props, 'disabled'>>;
    expectTypeOf(Basic).toEqualTypeOf<Expected>();
  });

  test('Correct args are inferred when type is widened for multiple decorators', () => {
    type Props = ButtonProps & { decoratorArg: number; decoratorArg2: string };

    const secondDecorator: DecoratorFn<{ decoratorArg2: string }> = (Story, { args }) => (
      <>
        Decorator: {args.decoratorArg2}
        <Story />
      </>
    );

    const meta = satisfies<Meta<Props>>()({
      component: Button,
      args: { disabled: false },
      decorators: [withDecorator, secondDecorator],
    });

    const Basic: StoryObj<typeof meta> = {
      args: { decoratorArg: 0, decoratorArg2: '', label: 'good' },
    };

    type Expected = ReactStory<Props, SetOptional<Props, 'disabled'>>;
    expectTypeOf(Basic).toEqualTypeOf<Expected>();
  });
});
