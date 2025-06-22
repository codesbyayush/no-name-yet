import { SectionCards } from '@/components/section-cards'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import { PlusIcon } from 'lucide-react'
import { RenderPostsList } from '@/components/admin/render-posts-list'

export const Route = createFileRoute('/_admin/boards')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    search: (search.search as string) || '',
    tag: (search.tag as string) || 'all',
    status: (search.status as string) || 'all',
    order: (search.order as string) || 'name-asc',
    tab: (search.tab as string) || 'all',
  }),
})

const mockBoards = [
  {
    id: 1,
    title: 'Product Feedback',
    description: 'Collect and manage product feedback from users',
    status: 'active',
    tags: ['feature-request', 'bug-report'],
  },
  {
    id: 2,
    title: 'Feature Requests',
    description: 'Track new feature requests and ideas',
    status: 'active',
    tags: ['enhancement'],
  },
  {
    id: 3,
    title: 'Bug Reports',
    description: 'Report and track software bugs',
    status: 'active',
    tags: ['bug'],
  },
  {
    id: 4,
    title: 'General Discussion',
    description: 'General community discussions and ideas',
    status: 'archived',
    tags: ['discussion'],
  },
]

function RouteComponent() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_admin/boards' })

  // Debounced search update to prevent excessive re-renders
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Local search state for immediate input feedback
  const [localSearchValue, setLocalSearchValue] = useState(search.search || '')

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Sync local search value with URL search param
  useEffect(() => {
    setLocalSearchValue(search.search || '')
  }, [search.search])

  // Update search params using TanStack Router's navigate
  const updateSearch = useCallback((updates: Record<string, string>) => {
    const newSearch = {
      search: search.search || '',
      tag: search.tag || 'all',
      status: search.status || 'all',
      order: search.order || 'name-asc',
      tab: search.tab || 'all',
      ...updates,
    }
    
    // Remove 'all' values and empty strings to keep URL clean
    const cleanSearch: Record<string, string> = {}
    Object.entries(newSearch).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== 'name-asc') {
        cleanSearch[key] = value
      }
    })
    
    // Ensure all required search parameters are present
    const finalSearch = {
      search: cleanSearch.search || '',
      tag: cleanSearch.tag || 'all',
      status: cleanSearch.status || 'all',
      order: cleanSearch.order || 'name-asc',
      tab: cleanSearch.tab || 'all',
    }
    
    navigate({
      to: '/boards',
      search: finalSearch,
      replace: true,
    })
  }, [navigate, search])

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      updateSearch({ search: value })
    }, 300) // 300ms debounce
    
    setSearchTimeout(timeout)
  }, [searchTimeout, updateSearch])

  // Handle immediate filter changes (no debouncing needed)
  const handleTagChange = useCallback((value: string) => {
    updateSearch({ tag: value })
  }, [updateSearch])

  const handleStatusChange = useCallback((value: string) => {
    updateSearch({ status: value })
  }, [updateSearch])

  const handleOrderChange = useCallback((value: string) => {
    updateSearch({ order: value })
  }, [updateSearch])

  const handleTabChange = useCallback((value: string) => {
    updateSearch({ tab: value })
  }, [updateSearch])

  // Filter boards based on URL state
  const filteredBoards = mockBoards.filter(board => {
    // Search filter
    if (search.search && !board.title.toLowerCase().includes(search.search.toLowerCase()) && 
        !board.description.toLowerCase().includes(search.search.toLowerCase())) {
      return false
    }
    
    // Tag filter
    if (search.tag !== 'all' && !board.tags.includes(search.tag)) {
      return false
    }
    
    // Status filter
    if (search.status !== 'all' && board.status !== search.status) {
      return false
    }
    
    return true
  })

  // Sort boards based on URL state
  const sortedBoards = [...filteredBoards].sort((a, b) => {
    switch (search.order) {
      case 'name-asc':
        return a.title.localeCompare(b.title)
      case 'name-desc':
        return b.title.localeCompare(a.title)
      case 'created-desc':
        return b.id - a.id // Using ID as proxy for creation date
      case 'created-asc':
        return a.id - b.id
      default:
        return 0
    }
  })

  // Get current board for individual tab view
  const currentBoard = search.tab !== 'all' 
    ? mockBoards.find(board => `board-${board.id}` === search.tab)
    : null

  return (
    <div>
      <div className='sticky -top-12 z-10'>
    <div className=' bg-background backdrop-blur-2xl max-w-5xl mx-auto'>
      <SiteHeader title='Boards'>
        <>
        <div className="flex items-center gap-3">
        <div className="relative">
                <Input
                  placeholder="Search boards..."
                  className="w-64"
                  value={localSearchValue}
                  onChange={(e) => {
                    setLocalSearchValue(e.target.value)
                    handleSearchChange(e.target.value)
                  }}
                />
              </div>
              
              {/* Tags Filter */}
              <Select value={search.tag} onValueChange={handleTagChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="feature-request">Feature Request</SelectItem>
                  <SelectItem value="bug-report">Bug Report</SelectItem>
                  <SelectItem value="enhancement">Enhancement</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="discussion">Discussion</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Status Filter */}
              <Select value={search.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Order */}
              <Select value={search.order} onValueChange={handleOrderChange}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="created-asc">Created (Oldest)</SelectItem>
                  <SelectItem value="created-desc">Created (Newest)</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </>
      </SiteHeader>
      <div className="flex flex-1 flex-col">
        {/* Top Menu */}
        <div className="bg-background/95 dark:bg-white backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3 md:px-6 ml-auto">
              
            
            {/* Right Side - Tabbed Navigation */}
            <div className="flex items-center">
              <Tabs value={search.tab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {mockBoards.map((board) => (
                    <TabsTrigger key={board.id} value={`board-${board.id}`}>
                      {board.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className='w-full border-t-4 border-muted'/>
    </div>
    <div className='p-6 md:px-10'>
      <RenderPostsList />
    </div>
    </div>
  )
}
