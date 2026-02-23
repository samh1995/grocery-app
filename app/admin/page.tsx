'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const STORES = ['No Frills', 'Loblaws', 'Real Canadian Superstore', 'FreshCo', 'Metro']
const CATEGORIES = ['Produce', 'Meat & Poultry', 'Seafood', 'Dairy & Eggs', 'Bakery', 'Frozen', 'Pantry', 'Snacks', 'Beverages', 'Deli', 'Other']

const ADMIN_PASSWORD = 'grocerydeals2026'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    store: '',
    product_name: '',
    category: '',
    sale_price: '',
    regular_price: '',
    unit: '',
    valid_from: '',
    valid_to: ''
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    const { error } = await supabase.from('deals').insert([{
      store: form.store,
      product_name: form.product_name,
      category: form.category,
      sale_price: parseFloat(form.sale_price),
      regular_price: form.regular_price ? parseFloat(form.regular_price) : null,
      unit: form.unit,
      valid_from: form.valid_from,
      valid_to: form.valid_to
    }])

    setLoading(false)
    if (error) {
      alert('Error saving deal: ' + error.message)
      console.error(error)
    } else {
      setSaved(true)
      setForm({
        store: form.store,
        product_name: '',
        category: form.category,
        sale_price: '',
        regular_price: '',
        unit: '',
        valid_from: form.valid_from,
        valid_to: form.valid_to
      })
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-4">🔒 Admin Access</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            onKeyDown={e => e.key === 'Enter' && password === ADMIN_PASSWORD && setAuthed(true)}
          />
          <button
            onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : alert('Wrong password')}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700"
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-full max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">📋 Add Deal</h1>
        <p className="text-gray-500 mb-6">Enter deals from this week's flyers.</p>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
            ✅ Deal saved! Add another one below.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
            <select value={form.store} onChange={e => update('store', e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">Select a store</option>
              {STORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input value={form.product_name} onChange={e => update('product_name', e.target.value)} required
              placeholder="e.g. Chicken Thighs Boneless"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => update('category', e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price ($)</label>
              <input type="number" step="0.01" value={form.sale_price} onChange={e => update('sale_price', e.target.value)} required
                placeholder="3.99"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price ($)</label>
              <input type="number" step="0.01" value={form.regular_price} onChange={e => update('regular_price', e.target.value)}
                placeholder="6.99"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input value={form.unit} onChange={e => update('unit', e.target.value)}
              placeholder="e.g. per lb, each, per kg, 500g"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
              <input type="date" value={form.valid_from} onChange={e => update('valid_from', e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
              <input type="date" value={form.valid_to} onChange={e => update('valid_to', e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Deal'}
          </button>
        </form>
      </div>
    </div>
  )
}