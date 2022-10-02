import React, { FC } from 'react';

interface TypeScriptHtmlComponentProps {
  text: string;
}

export const TypeScriptHtmlComponent: FC<
  React.HTMLAttributes<HTMLDivElement> & TypeScriptHtmlComponentProps
> = () => <div>My HTML component</div>;

export const component = TypeScriptHtmlComponent;
