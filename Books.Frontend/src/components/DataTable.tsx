import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
  keyFn: (row: T) => number | string;
}

const SkeletonCell = ({ width }: { width: string }) => (
  <div className={`h-3 shimmer rounded-lg ${width}`} />
);

export function DataTable<T>({ columns, data, loading, skeletonRows = 5, keyFn }: DataTableProps<T>) {
  return (
    <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
      <table className="table w-full">
        <thead>
          <tr className="bg-base-200/50 border-b border-base-200">
            {columns.map((col) => (
              <th key={col.key} className={`text-[10px] font-black uppercase tracking-widest text-base-content/40 py-3 ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="border-b border-base-200/60 last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    <SkeletonCell width="w-24" />
                  </td>
                ))}
              </tr>
            ))
            : data.map((row, i) => (
              <tr
                key={keyFn(row)}
                className="border-b border-base-200/60 last:border-0 hover:bg-base-50 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
