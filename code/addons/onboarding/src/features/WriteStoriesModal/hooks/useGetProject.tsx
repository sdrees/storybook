import { useEffect, useState } from 'react';

import dataJavascript from '../code/javascript';
import dataTypescript from '../code/typescript';
import type { CodeSnippets } from '../code/types';

type Project = {
  language: 'javascript' | 'typescript';
  framework: {
    name: string;
  };
};

export function useGetProject() {
  const [project, setProject] = useState<{
    data: CodeSnippets | null;
    error: Error | null;
  }>({ data: null, error: null });

  useEffect(() => {
    const getProject = async () => {
      try {
        const response = await fetch('/project.json');
        const projectInner = (await response.json()) as Project;
        const data = projectInner?.language === 'javascript' ? dataJavascript : dataTypescript;

        setProject({
          data,
          error: null,
        });
      } catch (e) {
        setProject({
          data: null,
          // @ts-expect-error (bad)
          error: e,
        });
      }
    };
    getProject();
  }, []);

  return project;
}
