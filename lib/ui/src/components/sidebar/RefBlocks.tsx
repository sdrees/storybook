import { window, document } from 'global';
import React, {
  FunctionComponent,
  useState,
  useCallback,
  Fragment,
  useContext,
  ComponentProps,
} from 'react';

import { Icons, WithTooltip, Spaced, Button } from '@storybook/components';
import { logger } from '@storybook/client-logger';
import { useStorybookApi } from '@storybook/api';
import { styled } from '@storybook/theming';
import { Location } from '@storybook/router';

import { Tree } from './Tree/Tree';
import { Loader, Contained } from './Loader';
import { ListItem } from './Tree/ListItem';
import { ExpanderContext } from './Tree/State';

import { Item, DataSet, BooleanSet } from './RefHelpers';

export type ListitemProps = ComponentProps<typeof ListItem>;

const Section = styled.section();

const RootHeading = styled.div(({ theme }) => ({
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  fontWeight: theme.typography.weight.black,
  fontSize: theme.typography.size.s1 - 1,
  lineHeight: '24px',
  color: theme.color.mediumdark,
  margin: '0 20px',
}));

const Text = styled.p(({ theme }) => ({
  fontSize: theme.typography.size.s2 - 1,
  margin: 0,
}));

const Head: FunctionComponent<ListitemProps> = (props) => {
  const api = useStorybookApi();
  const { setExpanded, expandedSet } = useContext(ExpanderContext);
  const { id, isComponent, childIds, refId } = props;

  const onClick = useCallback(
    (e) => {
      e.preventDefault();
      if (!expandedSet[id] && isComponent && childIds && childIds.length) {
        api.selectStory(childIds[0], undefined, { ref: refId });
      }
      setExpanded((s) => ({ ...s, [id]: !s[id] }));
    },
    [id, expandedSet[id]]
  );
  return <ListItem onClick={onClick} {...props} href={`#${id}`} />;
};

const Leaf: FunctionComponent<ListitemProps> = (props) => {
  const api = useStorybookApi();
  const { setExpanded } = useContext(ExpanderContext);
  const { id, refId } = props;
  const onClick = useCallback(
    (e) => {
      e.preventDefault();
      api.selectStory(id, undefined, { ref: refId });
      setExpanded((s) => ({ ...s, [id]: !s[id] }));
    },
    [id]
  );

  return (
    <Location>
      {({ viewMode }) => (
        <ListItem onClick={onClick} {...props} href={`?path=/${viewMode}/${id}`} />
      )}
    </Location>
  );
};

const ErrorDisplay = styled.pre(
  {
    width: 420,
    boxSizing: 'border-box',
    borderRadius: 8,
    overflow: 'auto',
    whiteSpace: 'pre',
  },
  ({ theme }) => ({
    color: theme.color.dark,
  })
);

const ErrorName = styled.strong(({ theme }) => ({
  color: theme.color.orange,
}));
const ErrorImportant = styled.strong(({ theme }) => ({
  color: theme.color.ancillary,
  textDecoration: 'underline',
}));
const ErrorDetail = styled.em(({ theme }) => ({
  color: theme.color.mediumdark,
}));

const firstLineRegex = /(Error): (.*)\n/;
const linesRegex = /at (?:(.*) )?\(?(.+)\)?/;
const ErrorFormatter: FunctionComponent<{ error: Error }> = ({ error }) => {
  const input = error.stack.toString();
  const [, type, name] = input.match(firstLineRegex);

  const rawLines = input.split(/\n/).slice(1);
  const [, ...lines] = rawLines
    .map((line) => {
      const r = line.match(linesRegex);

      return r ? { name: r[1], location: r[2].replace(document.location.origin, '') } : null;
    })
    .filter(Boolean);

  return (
    <Fragment>
      <span>{type}</span>: <ErrorName>{name}</ErrorName>
      <br />
      {lines.map((l, i) =>
        l.name ? (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            {'  '}at <ErrorImportant>{l.name}</ErrorImportant> (
            <ErrorDetail>{l.location}</ErrorDetail>)
            <br />
          </Fragment>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            {'  '}at <ErrorDetail>{l.location}</ErrorDetail>
            <br />
          </Fragment>
        )
      )}
    </Fragment>
  );
};

export const AuthBlock: FunctionComponent<{ authUrl: string; id: string }> = ({ authUrl, id }) => {
  const [isAuthAttempted, setAuthAttempted] = useState(false);

  const refresh = useCallback(() => {
    window.document.location.reload();
  }, []);

  const open = useCallback((e) => {
    e.preventDefault();
    const childWindow = window.open(authUrl, `storybook_auth_${id}`, 'resizable,scrollbars');

    // poll for window to close
    const timer = setInterval(() => {
      if (!childWindow) {
        logger.error('unable to access authUrl window');
        clearInterval(timer);
      } else if (childWindow.closed) {
        clearInterval(timer);
        setAuthAttempted(true);
      }
    }, 1000);
  }, []);

  return (
    <Contained>
      <Spaced>
        {isAuthAttempted ? (
          <Fragment>
            <Text>
              Authentication on <strong>{authUrl}</strong> seems to have concluded, refresh the page
              to fetch this storybook
            </Text>
            <div>
              <Button small gray onClick={refresh}>
                <Icons icon="sync" />
                Refresh the page
              </Button>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <Text>Browse this secure storybook</Text>
            <div>
              <Button small gray onClick={open}>
                <Icons icon="lock" />
                Login
              </Button>
            </div>
          </Fragment>
        )}
      </Spaced>
    </Contained>
  );
};

export const ErrorBlock: FunctionComponent<{ error: Error }> = ({ error }) => (
  <Contained>
    <Spaced>
      <Text>Ow now! something went wrong loading this storybook</Text>
      <WithTooltip
        trigger="click"
        closeOnClick={false}
        tooltip={
          <ErrorDisplay>
            <ErrorFormatter error={error} />
          </ErrorDisplay>
        }
      >
        <Button small gray>
          <Icons icon="doclist" />
          View error
        </Button>
      </WithTooltip>
    </Spaced>
  </Contained>
);

export const LoaderBlock: FunctionComponent<{ isMain: boolean }> = ({ isMain }) => (
  <Contained>
    <Loader size={isMain ? 17 : 5} />
  </Contained>
);

const TreeComponents = {
  Head,
  Leaf,
  Branch: Tree,
  List: styled.div({}),
};
export const ContentBlock: FunctionComponent<{
  others: Item[];
  dataSet: DataSet;
  selectedSet: BooleanSet;
  expandedSet: BooleanSet;
  roots: Item[];
}> = ({ others, dataSet, selectedSet, expandedSet, roots }) => (
  <Fragment>
    <Spaced row={1.5}>
      {others.length ? (
        <Section data-title="categorized" key="categorized">
          {others.map(({ id }) => (
            <Tree
              key={id}
              depth={0}
              dataset={dataSet}
              selected={selectedSet}
              expanded={expandedSet}
              root={id}
              {...TreeComponents}
            />
          ))}
        </Section>
      ) : null}

      {roots.map(({ id, name, children }) => (
        <Section data-title={name} key={id}>
          <RootHeading className="sidebar-subheading">{name}</RootHeading>
          {children.map((child) => (
            <Tree
              key={child}
              depth={0}
              dataset={dataSet}
              selected={selectedSet}
              expanded={expandedSet}
              root={child}
              {...TreeComponents}
            />
          ))}
        </Section>
      ))}
    </Spaced>
  </Fragment>
);
