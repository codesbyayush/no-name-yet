import { Button } from "@/components/ui/button";
import { getFeedbacks } from "@/lib/utils";
import { client } from "@/utils/orpc";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { CreateEditPost } from "@/components/create-edit-post";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { useState, useCallback, useRef, useEffect } from "react";

export const Route = createFileRoute("/_public/board/")({
  component: BoardIndexPage,
});

function BoardIndexPage() {
  const AllFeedbacks = getFeedbacks()
  const navigate = useNavigate({ from: '/board' })
  
  // Replace useQuery with useInfiniteQuery for posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['all-posts'],
    queryFn: ({ pageParam = 0 }) => 
      client.getOrganizationPosts({ offset: pageParam, take: 10 }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.offset + lastPage.pagination.take : undefined,
    initialPageParam: 0,
  })

  // Flatten all posts from all pages
  const allPosts = data?.pages.flatMap(page => page.posts) ?? []
  
  const [position, setPosition] = useState("bottom");

  const { data: boards } = useQuery({
    queryKey: ["public-boards"],
    queryFn: () => client.getAllPublicBoards(),
  });

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const triggerRef = useRef<HTMLDivElement | null>(null)

  const lastPostCallback = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, {
      rootMargin: '100px' // Trigger 100px before reaching the element
    })
    
    if (node) observerRef.current.observe(node)
  }, [isLoading, hasNextPage, fetchNextPage, isFetchingNextPage])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])
  return (
    <div>
      <div className="flex justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-2">
          <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span>
          search
        </span>
        </div>
      </div>
    <div className="flex gap-4 relative">
      <div className="border-1 p-4 flex-1">
        {isLoading && <div>Loading posts...</div>}
        {isError && <div>Error loading posts</div>}
        {allPosts.map((f, i) => {
          const isLastPost = i === allPosts.length - 1
          const isSecondLastPost = i === allPosts.length - 2
          
          return (
            <div 
              key={f.id}
              ref={isSecondLastPost ? lastPostCallback : null}
              onClick={() => navigate({
                to: f.id
              })} 
              className={`${i > 0 ? 'border-t-2' : ''} py-4 space-y-2 cursor-pointer hover:bg-gray-50`}
            >
              <h4 className="font-semibold text-lg">{f.title}</h4>
              <p className="text-sm text-[#0007149f]">{f.content}</p>
              <div>
                <div>icon, name, date</div>
                <div>status, comms, likes</div>
              </div>
            </div>
          )
        })}
        
        {/* Loading indicator for next page */}
        {isFetchingNextPage && (
          <div className="py-4 text-center">
            <div className="text-sm text-gray-500">Loading more posts...</div>
          </div>
        )}
        
        {/* End of posts indicator */}
        {!hasNextPage && allPosts.length > 0 && (
          <div className="py-4 text-center">
            <div className="text-sm text-gray-500">No more posts to load</div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 sticky top-0 h-fit">
        <div className="border-1 p-4 bg-white z-10">
          <div className="mb-2 text-sm text-gray-600">
            Got an idea?
          </div>
          <CreateEditPost 
            boardId={boards?.boards[0].id || ''} // TODO: Get actual board ID from context
            mode="create"
            onSuccess={() => {
              // Refresh the posts list
              window.location.reload(); // Temporary until we have proper invalidation
            }}
          />
        </div>
        <div>
          <h4>Boards</h4>
          {/* Boards content */}
        </div>
      </div>
    </div>
    </div>
  );
}
