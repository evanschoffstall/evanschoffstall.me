"use client";

import { getMDXComponent } from "mdx-bundler/client";
import * as React from "react";

import { mdxComponents } from "@/components/mdx";

interface MdxProps {
  code: string;
}

/**
 * Renders compiled MDX content using the site's curated component overrides.
 * @param props - The compiled MDX module code.
 * @returns The rendered MDX content tree.
 */
export function Mdx(props: MdxProps) {
  const { code } = props;
  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <div className="mdx">
      <Component components={mdxComponents} />
    </div>
  );
}
