import * as React from "react";

import { cn } from "@/shared";

/**
 * Table props forwarded from compiled MDX table nodes.
 */
type TableProps = React.HTMLAttributes<HTMLTableElement>;
/**
 * Data-cell props forwarded from compiled MDX table nodes.
 */
type TdProps = React.TdHTMLAttributes<HTMLTableCellElement>;
/**
 * Header-cell props forwarded from compiled MDX table nodes.
 */
type ThProps = React.ThHTMLAttributes<HTMLTableCellElement>;
/**
 * Table-row props forwarded from compiled MDX table nodes.
 */
type TrProps = React.HTMLAttributes<HTMLTableRowElement>;

/**
 * Renders tables inside a horizontally scrollable MDX wrapper.
 * @param props - Table props supplied by the compiled MDX content.
 * @returns The rendered table wrapper and table.
 */
export function renderTable(props: TableProps) {
  const { className, ...tableProps } = props;

  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full", className)} {...tableProps} />
    </div>
  );
}

/**
 * Renders table data cells inside MDX content.
 * @param props - Table cell props supplied by the compiled MDX content.
 * @returns The rendered data-cell element.
 */
export function renderTableCell(props: TdProps) {
  const { className, ...cellProps } = props;

  return (
    <td
      className={cn(
        `
      border border-zinc-200 px-4 py-2 text-left
      [&[align=center]]:text-center
      [&[align=right]]:text-right
    `,
        className,
      )}
      {...cellProps}
    />
  );
}

/**
 * Renders table header cells inside MDX content.
 * @param props - Table header-cell props supplied by the compiled MDX content.
 * @returns The rendered header-cell element.
 */
export function renderTableHeaderCell(props: ThProps) {
  const { className, ...headerCellProps } = props;

  return (
    <th
      className={cn(
        `
      border border-zinc-200 px-4 py-2 text-left font-bold
      [&[align=center]]:text-center
      [&[align=right]]:text-right
    `,
        className,
      )}
      {...headerCellProps}
    />
  );
}

/**
 * Renders table rows inside MDX content.
 * @param props - Table-row props supplied by the compiled MDX content.
 * @returns The rendered table row element.
 */
export function renderTableRow(props: TrProps) {
  const { className, ...rowProps } = props;

  return (
    <tr
      className={cn(
        `
      m-0 border-t border-zinc-300 p-0
      even:bg-zinc-100
    `,
        className,
      )}
      {...rowProps}
    />
  );
}
