import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import Stepper from '../../common/Stepper';
import { useBuildingWizardStore } from '../../../store/buildingWizardStore';

const STEP_LABELS = [
  'Building Info',
  'Locations',
  'Connector',
  'Endpoints',
  'Metrics',
  'Finish',
];

interface Props {
  children: React.ReactNode;
  onNext: () => Promise<boolean> | boolean;
  onBack?: () => void;
  canSkip?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  isSubmitting?: boolean;
}

export default function WizardShell({
  children,
  onNext,
  onBack,
  canSkip = false,
  nextLabel,
  nextDisabled = false,
  isSubmitting = false,
}: Props) {
  const { currentStep, completedSteps, setStep, completeStep } = useBuildingWizardStore();

  const isLast = currentStep === STEP_LABELS.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = async () => {
    const ok = await onNext();
    if (ok) {
      completeStep(currentStep);
      if (!isLast) setStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    if (!isLast) setStep(currentStep + 1);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (!isFirst) {
      setStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">New Building Setup</h2>
        <p className="text-sm text-gray-500 mt-1">
          Step {currentStep + 1} of {STEP_LABELS.length}
        </p>
      </div>

      {/* Stepper */}
      <Stepper
        steps={STEP_LABELS}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Step content */}
      <div className="bg-white rounded-xl border p-6 min-h-[400px]">
        {children}
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={isFirst && !onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {canSkip && !isLast && (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={nextDisabled || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                {nextLabel || (isLast ? 'Launch Building' : 'Next')}
                {!isLast && <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
