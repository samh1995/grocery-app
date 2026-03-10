'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { filterDeals } from '../../lib/dealFilters'
import { tagDeal, getCategories } from '../../lib/categoryTagger'
import { useRouter } from 'next/navigation'

export default function FeedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [storeFilter, setStoreFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUser(session.user)

      const { data: prof } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!prof) { router.push('/'); return }
      setProfile(prof)

      const today = new Date().toISOString().split('T')[0]
      const { data: dealData } = await supabase
        .from('deals')
        .select('*')
        .lte('valid_from', today)
        .gte('valid_to', today)
        .order('category')

      const filtered = filterDeals(dealData || [], prof)

      // Tag each deal with categories
      const tagged = filtered.map(d => ({ ...d, _categories: tagDeal(d) }))

      // Log category coverage
      const catCounts: Record<string, number> = {}
      for (const d of tagged) {
        for (const c of d._categories) {
          catCounts[c] = (catCounts[c] || 0) + 1
        }
      }
      console.log(`Total deals: ${tagged.length}`)
      console.log('Category counts:', catCounts)
      console.log(`Other: ${catCounts['Other'] || 0}`)
      console.log('Other deals:', tagged.filter(d => d._categories.includes('Other')).map(d => d.product_name))

      setDeals(tagged)
      setLoading(false)
    }
    load()
  }, [router])

  const getDiscount = (sale: number, regular: number) => {
    if (!regular || !sale) return null
    return Math.round(((regular - sale) / regular) * 100)
  }

  const stores = ['All', ...new Set(deals.map(d => d.store))]

  // Categories that have at least 1 deal
  const activeCategories = useMemo(() => {
    const allCats = getCategories()
    const present = new Set<string>()
    for (const d of deals) {
      for (const c of d._categories) present.add(c)
    }
    return ['All', ...allCats.filter(c => present.has(c))]
  }, [deals])

  // Apply both filters (AND logic)
  const filtered = useMemo(() => {
    let result = deals
    if (storeFilter !== 'All') {
      result = result.filter(d => d.store === storeFilter)
    }
    if (categoryFilter !== 'All') {
      result = result.filter(d => d._categories.includes(categoryFilter))
    }
    return result
  }, [deals, storeFilter, categoryFilter])

  const grouped = filtered.reduce((acc: Record<string, any[]>, deal: any) => {
    const cats: string[] = deal._categories
    for (const cat of cats) {
      if (categoryFilter !== 'All' && cat !== categoryFilter) continue
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(deal)
    }
    return acc
  }, {})

  // Sort groups by category order
  const categoryOrder = getCategories()
  const sortedGroups = Object.entries(grouped).sort(
    (a, b) => categoryOrder.indexOf(a[0]) - categoryOrder.indexOf(b[0])
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading deals...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">🛒 This Week's Deals</h1>
            <p className="text-sm text-gray-400">Hey {profile?.name} — {deals.length} deals matched</p>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/auth') }}
            className="text-sm text-gray-400 hover:text-gray-600">
            Log out
          </button>
        </div>
      </div>

      {/* Store Filter */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="max-w-lg mx-auto flex gap-2">
          {stores.map(s => (
            <button key={s} onClick={() => setStoreFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                storeFilter === s
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 pb-3 overflow-x-auto">
        <div className="max-w-lg mx-auto flex gap-2">
          {activeCategories.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === c
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Deals */}
      <div className="px-4 pb-8">
        <div className="max-w-lg mx-auto">
          {sortedGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No deals this week. Check back soon!</p>
            </div>
          ) : (
            sortedGroups.map(([category, catDeals]) => (
              <div key={category} className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{category}</h2>
                <div className="space-y-3">
                  {(catDeals as any[]).map((deal: any) => {
                    const discount = getDiscount(deal.sale_price, deal.regular_price)
                    return (
                      <div key={deal.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{deal.product_name}</p>
                            <p className="text-sm text-gray-400 mt-1">{deal.store}{deal.unit ? ` · ${deal.unit}` : ''}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-green-600">${Number(deal.sale_price).toFixed(2)}</p>
                            {deal.regular_price && (
                              <p className="text-sm text-gray-400 line-through">${Number(deal.regular_price).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        {discount && (
                          <div className="mt-2">
                            <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                              Save {discount}%
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
