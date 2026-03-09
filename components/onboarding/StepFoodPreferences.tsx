import React from 'react'

type StepFoodPreferencesProps = {
  diet: string
  allergies: string[]
  cuisines: string[]
  spice: string
  onUpdate: (field: 'diet' | 'spice', value: string) => void
  onToggleMulti: (field: 'allergies' | 'cuisines', value: string) => void
}

const DIET_OPTIONS = [
  'Omnivore — I eat everything',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Halal',
  'Kosher',
  'Other'
]

const ALLERGY_OPTIONS = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'None']

const CUISINE_OPTIONS = [
  'Canadian/American',
  'Italian',
  'Chinese',
  'Indian',
  'Mexican',
  'Japanese',
  'Korean',
  'Middle Eastern',
  'Caribbean',
  'Thai',
  'Greek',
  'French',
  'Other'
]

const SPICE_OPTIONS = [
  'Mild',
  'Medium',
  'Spicy',
  'Bring the heat'
]

export function StepFoodPreferences({
  diet,
  allergies,
  cuisines,
  spice,
  onUpdate,
  onToggleMulti
}: StepFoodPreferencesProps) {
  const isSelected = (list: string[], value: string) => list.includes(value)

  const handleAllergyToggle = (value: string) => {
    if (value === 'None') {
      onToggleMulti('allergies', 'None')
      return
    }
    if (allergies.includes('None')) {
      onToggleMulti('allergies', 'None')
    }
    onToggleMulti('allergies', value)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase mb-1">
          Step 3
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-1">
          Your food preferences
        </h2>
        <p className="text-sm text-slate-500">
          We&apos;ll use this to avoid ingredients you don&apos;t want and highlight deals you&apos;ll actually enjoy.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            How would you describe your diet?
          </label>
          <div className="space-y-2">
            {DIET_OPTIONS.map(option => {
              const active = diet === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUpdate('diet', option)}
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
            Any allergies or ingredients to avoid? <span className="text-xs font-normal text-slate-400">(pick all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map(option => {
              const selected = isSelected(allergies, option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAllergyToggle(option)}
                  className={`inline-flex items-center rounded-2xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    selected
                      ? 'border-rose-400 bg-rose-50 text-rose-800 shadow-sm shadow-rose-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50'
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
            What cuisines do you love? <span className="text-xs font-normal text-slate-400">(pick all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map(option => {
              const selected = isSelected(cuisines, option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onToggleMulti('cuisines', option)}
                  className={`inline-flex items-center rounded-2xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    selected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
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
            How do you feel about spice?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SPICE_OPTIONS.map(option => {
              const active = spice === option
              const icon =
                option === 'Mild'
                  ? '🌶️'
                  : option === 'Medium'
                    ? '🌶️🌶️'
                    : option === 'Spicy'
                      ? '🌶️🌶️🌶️'
                      : '🔥'

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUpdate('spice', option)}
                  className={`flex h-11 items-center justify-between rounded-2xl border px-3 text-sm font-medium transition-all ${
                    active
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <span>{option}</span>
                  <span className="text-lg">{icon}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

