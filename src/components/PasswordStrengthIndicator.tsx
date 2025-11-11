import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator = ({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) => {
  const requirements = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const strength = useMemo(() => {
    const met = Object.values(requirements).filter(Boolean).length;
    if (met === 0) return { level: 0, label: "", color: "" };
    if (met <= 2) return { level: 1, label: "Fraca", color: "bg-destructive" };
    if (met <= 3) return { level: 2, label: "Média", color: "bg-yellow-500" };
    if (met <= 4) return { level: 3, label: "Boa", color: "bg-blue-500" };
    return { level: 4, label: "Forte", color: "bg-green-500" };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Barras de força */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              level <= strength.level ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>
      
      {strength.level > 0 && (
        <p className="text-xs font-medium">
          Força da senha: <span className={cn("font-bold")}>{strength.label}</span>
        </p>
      )}

      {/* Requisitos */}
      {showRequirements && (
        <div className="space-y-1.5 text-xs">
          <p className="font-medium text-muted-foreground">Sua senha deve conter:</p>
          <div className="space-y-1">
            <RequirementItem met={requirements.length} text="Mínimo de 8 caracteres" />
            <RequirementItem met={requirements.uppercase} text="Pelo menos 1 letra maiúscula" />
            <RequirementItem met={requirements.lowercase} text="Pelo menos 1 letra minúscula" />
            <RequirementItem met={requirements.number} text="Pelo menos 1 número" />
            <RequirementItem met={requirements.special} text="Pelo menos 1 caractere especial (!@#$%...)" />
          </div>
        </div>
      )}
    </div>
  );
};

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-2">
    {met ? (
      <Check className="w-3.5 h-3.5 text-green-600" />
    ) : (
      <X className="w-3.5 h-3.5 text-muted-foreground" />
    )}
    <span className={cn(
      "text-xs",
      met ? "text-green-600 font-medium" : "text-muted-foreground"
    )}>
      {text}
    </span>
  </div>
);