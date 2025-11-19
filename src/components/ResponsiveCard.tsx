import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  dense?: boolean; // Para layouts mais compactos em mobile
  headerAction?: ReactNode;
}

/**
 * Card responsivo com padding adaptativo
 * 
 * @example
 * <ResponsiveCard 
 *   title="Finanças" 
 *   description="Resumo mensal"
 *   dense
 * >
 *   <p>Conteúdo</p>
 * </ResponsiveCard>
 */
export const ResponsiveCard = ({ 
  title, 
  description,
  children, 
  className,
  dense = false,
  headerAction
}: ResponsiveCardProps) => {
  return (
    <Card className={cn('transition-all', className)}>
      {(title || description || headerAction) && (
        <CardHeader className={cn(
          'space-y-1.5',
          dense ? 'p-3 sm:p-4 md:p-5' : 'p-4 sm:p-5 md:p-6'
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              {title && (
                <CardTitle className="text-lg sm:text-xl md:text-2xl truncate">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-xs sm:text-sm line-clamp-2">
                  {description}
                </CardDescription>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        dense ? 'p-3 pt-0 sm:p-4 sm:pt-0 md:p-5 md:pt-0' : 'p-4 pt-0 sm:p-5 sm:pt-0 md:p-6 md:pt-0'
      )}>
        {children}
      </CardContent>
    </Card>
  );
};
