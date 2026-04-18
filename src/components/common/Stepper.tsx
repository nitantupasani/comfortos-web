import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  completedSteps: Set<number>;
}

export default function Stepper({ steps, currentStep, completedSteps }: StepperProps) {
  return (
    <div className="flex items-center gap-1 w-full overflow-x-auto pb-2">
      {steps.map((label, idx) => {
        const isCompleted = completedSteps.has(idx);
        const isCurrent = idx === currentStep;
        const isPast = idx < currentStep;

        return (
          <div key={idx} className="flex items-center flex-1 min-w-0">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : isPast
                        ? 'bg-primary-200 text-primary-700'
                        : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span
                className={`text-[10px] font-medium text-center leading-tight truncate max-w-[72px] ${
                  isCurrent ? 'text-primary-700' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded-full mt-[-18px] ${
                  isCompleted || isPast ? 'bg-primary-300' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
