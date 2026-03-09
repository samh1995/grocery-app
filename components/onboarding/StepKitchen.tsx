import React from 'react'

type StepKitchenProps = {
  comfortLevel: string
  cookTime: string
  growSkills: string
  name: string
  onUpdate: (field: 'comfortLevel' | 'cookTime' | 'growSkills', value: string) => void
}

const COMFORT_OPTIONS = [
  '🔰 Beginner — keep it simple',
  '👨‍🍳 Comfortable — I can follow most recipes',
  '🧑‍🍳 Advanced — I love to experiment'
]

const COOK_TIME_OPTIONS = [
  '⚡ Under 15 min',
  '🕐 15–30 min',
  '🕑 30–60 min',
  '🍲 I enjoy long cooks'
]

const GROW_SKILLS_OPTIONS = [
  'Yes — challenge me!',
  'Sometimes — mix easy and new',
  'No — keep it simple'
]

export function StepKitchen({
  comfortLevel,
  cookTime,
  growSkills,
  name,
  onUpdate
}: StepKitchenProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase mb-1">
          Step 4
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-1">
          In the kitchen
        </h2>
        <p className="text-sm text-slate-500">
          Help us match recipes and deals to how you actually cook
          {name ? `, ${name}` : ''}.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            How comfortable are you in the kitchen?
          </label>
          <div className="space-y-2">
            {COMFORT_OPTIONS.map(option => {
              const active = comfortLevel === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUpdate('comfortLevel', option)}
                  className={`w-full rounded-2xl border px-4 py-2.5 text-left text-sm transition-all ${
                    active
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            How much time do you usually have to cook?
          </label>
          <div className="space-y-2">
            {COOK_TIME_OPTIONS.map(option => {
              const active = cookTime === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUpdate('cookTime', option)}
                  className={`w-full rounded-2xl border px-4 py-2.5 text-left text-sm transition-all ${
                    active
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            Would you like to grow your cooking skills?
          </label>
          <div className="space-y-2">
            {GROW_SKILLS_OPTIONS.map(option => {
              const active = growSkills === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUpdate('growSkills', option)}
                  className={`w-full rounded-2xl border px-4 py-2.5 text-left text-sm transition-all ${
                    active
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900">
          We&apos;ll use your answers to suggest recipes that match your comfort level and time,
          and surface grocery deals that fit your weekly rhythm.
        </div>
      </div>
    </div>
  )
}

