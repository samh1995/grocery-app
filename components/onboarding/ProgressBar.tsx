import React from 'react'

type ProgressBarProps = {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100

  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 gap-2">
        {steps.map(step => {
          const isActive = step === currentStep
          const isCompleted = step < currentStep

          return (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isActive
                    ? 'bg-emerald-300'
                    : 'bg-slate-200'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}

