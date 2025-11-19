import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface Column {
  key: string;
  label: string;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  renderCell: (item: any, column: Column) => ReactNode;
  renderMobileCard?: (item: any, index: number) => ReactNode;
  className?: string;
  emptyMessage?: string;
}

/**
 * Tabela responsiva que muda para cards em mobile
 * 
 * @example
 * <ResponsiveTable
 *   columns={[
 *     { key: 'name', label: 'Nome' },
 *     { key: 'value', label: 'Valor', hideOnMobile: true }
 *   ]}
 *   data={items}
 *   renderCell={(item, col) => item[col.key]}
 * />
 */
export const ResponsiveTable = ({
  columns,
  data,
  renderCell,
  renderMobileCard,
  className,
  emptyMessage = "Nenhum item encontrado"
}: ResponsiveTableProps) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop/Tablet Table */}
      <div className={cn("hidden md:block overflow-x-auto -mx-4 md:mx-0", className)}>
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black/5 dark:ring-white/10 md:rounded-lg">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold",
                        column.hideOnTablet && "hidden lg:table-cell",
                        column.className
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {data.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap",
                          column.hideOnTablet && "hidden lg:table-cell",
                          column.className
                        )}
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((item, idx) => (
          <Card key={idx} className="p-4">
            {renderMobileCard ? renderMobileCard(item, idx) : (
              <div className="space-y-2">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map(column => (
                    <div 
                      key={column.key} 
                      className="flex justify-between items-start gap-2"
                    >
                      <span className="font-medium text-sm text-muted-foreground min-w-[100px]">
                        {column.label}:
                      </span>
                      <span className="text-sm text-right flex-1">
                        {renderCell(item, column)}
                      </span>
                    </div>
                  ))
                }
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
};
