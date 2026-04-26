import type { ElementType } from "react";

import Image from "next/image";

import {
  renderAnchor,
  renderBlockquote,
  renderCode,
  renderImage,
  renderListItem,
  renderOrderedList,
  renderParagraph,
  renderPre,
  renderUnorderedList,
} from "@/components/mdx/content-renderers";
import {
  renderH1,
  renderH2,
  renderH3,
  renderH4,
  renderH5,
  renderH6,
  renderHr,
} from "@/components/mdx/heading-renderers";
import {
  renderTable,
  renderTableCell,
  renderTableHeaderCell,
  renderTableRow,
} from "@/components/mdx/table-renderers";

/** Curated MDX component overrides shared by compiled content pages. */
export const mdxComponents: Record<string, ElementType> = {
  a: renderAnchor,
  blockquote: renderBlockquote,
  code: renderCode,
  h1: renderH1,
  h2: renderH2,
  h3: renderH3,
  h4: renderH4,
  h5: renderH5,
  h6: renderH6,
  hr: renderHr,
  Image,
  img: renderImage,
  li: renderListItem,
  ol: renderOrderedList,
  p: renderParagraph,
  pre: renderPre,
  table: renderTable,
  td: renderTableCell,
  th: renderTableHeaderCell,
  tr: renderTableRow,
  ul: renderUnorderedList,
};
