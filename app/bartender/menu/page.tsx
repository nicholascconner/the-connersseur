'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarqueeLogo from '@/components/MarqueeLogo';
import MenuItemToggle from '@/components/MenuItemToggle';
import { MenuItem } from '@/types';

const CATEGORY_ORDER = ['Cocktails', 'Wine', 'Beer', 'Spirits', 'Non-Alcoholic'];

function sortCategories(a: string, b: string) {
  const ai = CATEGORY_ORDER.indexOf(a);
  const bi = CATEGORY_ORDER.indexOf(b);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
}

export default function ManageMenuPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());

  // Auth check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authenticated = sessionStorage.getItem('bartender_authenticated');
      if (authenticated === 'true') {
        setIsAuthenticated(true);
      } else {
        router.push('/bartender');
      }
    }
  }, [router]);

  // Fetch all menu items
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchItems = async () => {
      try {
        const response = await fetch('/api/menu/manage?auth=session');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setMenuItems(data.items || []);
      } catch {
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isAuthenticated]);

  // Group and filter items
  const categorizedItems = useMemo(() => {
    const filtered = searchQuery
      ? menuItems.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ingredients.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : menuItems;

    const grouped: Record<string, MenuItem[]> = {};
    for (const item of filtered) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }
    return grouped;
  }, [menuItems, searchQuery]);

  const sortedCategories = Object.keys(categorizedItems).sort(sortCategories);

  // Stats
  const activeCount = menuItems.filter(i => i.is_active).length;
  const totalCount = menuItems.length;

  // Toggle a single item
  const handleToggle = async (itemId: string, newActive: boolean) => {
    setMenuItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, is_active: newActive } : item
    ));
    setSavingItems(prev => new Set(prev).add(itemId));

    try {
      const response = await fetch('/api/menu/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: itemId, is_active: newActive }],
          session_auth: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
    } catch {
      // Rollback
      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, is_active: !newActive } : item
      ));
    } finally {
      setSavingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Toggle all items in a category
  const handleCategoryToggle = async (category: string, newActive: boolean) => {
    const categoryItems = menuItems.filter(i => i.category === category);
    const itemsToUpdate = categoryItems.filter(i => i.is_active !== newActive);

    if (itemsToUpdate.length === 0) return;

    const ids = itemsToUpdate.map(i => i.id);

    // Optimistic update
    setMenuItems(prev => prev.map(item =>
      item.category === category ? { ...item, is_active: newActive } : item
    ));
    setSavingItems(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });

    try {
      const response = await fetch('/api/menu/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: ids.map(id => ({ id, is_active: newActive })),
          session_auth: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
    } catch {
      // Rollback
      setMenuItems(prev => prev.map(item => {
        if (ids.includes(item.id)) {
          return { ...item, is_active: !newActive };
        }
        return item;
      }));
    } finally {
      setSavingItems(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  // Collapse/expand
  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const collapseAll = () => setCollapsedCategories(new Set(sortedCategories));
  const expandAll = () => setCollapsedCategories(new Set());
  const allCollapsed = sortedCategories.length > 0 && sortedCategories.every(c => collapsedCategories.has(c));

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-burgundy text-xl font-bold">Loading menu library...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-red-600 text-xl font-bold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="header-gradient py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Top Row - Nav */}
          <div className="flex justify-end gap-3 mb-4">
            <Link href="/bartender" className="btn-pill-gold text-sm">
              Dashboard
            </Link>
            <Link href="/" className="btn-pill-gold text-sm">
              Guest Menu
            </Link>
          </div>

          {/* Logo & Title */}
          <div className="text-center mb-7">
            <MarqueeLogo size="small" />
            <p className="text-white/90 font-bold mt-3 text-xl">Manage Menu</p>
            <p className="text-white/60 mt-1 text-sm font-semibold">
              {activeCount} of {totalCount} drinks active
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drinks by name, description, or ingredients..."
                className="search-input"
              />
            </div>
          </div>

          {/* Collapse/Expand toggle */}
          <div className="flex justify-center">
            <button
              onClick={allCollapsed ? expandAll : collapseAll}
              className="text-white/70 hover:text-white text-sm font-semibold transition-colors"
            >
              {allCollapsed ? 'Expand All Categories' : 'Collapse All Categories'}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Items by Category */}
      <main className="max-w-4xl mx-auto px-6 mt-8">
        {sortedCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-semibold">
            No drinks match your search.
          </div>
        ) : (
          sortedCategories.map(category => {
            const items = categorizedItems[category];
            const isCollapsed = collapsedCategories.has(category);
            const categoryActiveCount = items.filter(i => i.is_active).length;
            const allActive = categoryActiveCount === items.length;
            const noneActive = categoryActiveCount === 0;

            return (
              <section key={category} className="mb-8">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-3 group"
                  >
                    <span
                      className={`text-gray-400 transition-transform duration-200 text-sm ${
                        isCollapsed ? '-rotate-90' : 'rotate-0'
                      }`}
                    >
                      ▼
                    </span>
                    <h2 className="category-header !mb-0 group-hover:opacity-80 transition-opacity">
                      {category}
                    </h2>
                    <span className="text-sm font-semibold text-gray-400">
                      {categoryActiveCount}/{items.length} active
                    </span>
                  </button>

                  {/* Category Toggle */}
                  <button
                    onClick={() => handleCategoryToggle(category, !allActive)}
                    className={`
                      px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                      ${allActive
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : noneActive
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }
                    `}
                  >
                    {allActive ? 'Disable All' : 'Enable All'}
                  </button>
                </div>

                {/* Items Grid */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map(item => (
                      <MenuItemToggle
                        key={item.id}
                        item={item}
                        isSaving={savingItems.has(item.id)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
