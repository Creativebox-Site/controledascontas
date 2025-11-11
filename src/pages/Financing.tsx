import { useState } from "react";
import { FinancingForm, FinancingData } from "@/components/FinancingForm";
import { FinancingResults } from "@/components/FinancingResults";
import { FinancingComparison } from "@/components/FinancingComparison";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinancingProps {
  currency: string;
}

export const Financing = ({ currency }: FinancingProps) => {
  const [financingData, setFinancingData] = useState<FinancingData | null>(null);

  const handleCalculate = (data: FinancingData) => {
    setFinancingData(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Financiamento Inteligente</h2>
        <p className="text-muted-foreground">
          Descubra se seu financiamento é vantajoso e tome decisões mais inteligentes
        </p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lightbulb className="w-6 h-6" />
            Como Funciona?
          </CardTitle>
          <CardDescription className="text-base">
            Esta ferramenta ajuda você a entender o custo real do seu financiamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Informe os Dados</p>
                <p className="text-muted-foreground">Valor do bem, parcelas e prazo do financiamento</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Analisamos a Taxa</p>
                <p className="text-muted-foreground">Calculamos os juros e comparamos com o mercado</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Veja Alternativas</p>
                <p className="text-muted-foreground">Compare com opção de investir e comprar à vista</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <FinancingForm onCalculate={handleCalculate} />
        </div>

        <div>
          {!financingData ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center space-y-4 py-12">
                <Calculator className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Preencha os dados ao lado</p>
                  <p className="text-muted-foreground">
                    Vamos analisar seu financiamento e mostrar insights valiosos
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Análise
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Comparação
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis" className="mt-4">
                <FinancingResults data={financingData} />
              </TabsContent>
              
              <TabsContent value="comparison" className="mt-4">
                <FinancingComparison data={financingData} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};
