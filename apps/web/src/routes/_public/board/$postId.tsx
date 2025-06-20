import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Button } from '@/components/ui/button'
import { client } from '@/utils/orpc';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useRef, useEffect } from "react";
import { CreateEditPost } from "@/components/create-edit-post";

export const Route = createFileRoute('/_public/board/$postId')({
  component: RouteComponent,
})



function RouteComponent() {

  const { postId } = Route.useParams();
  
  // Replace useQuery with useInfiniteQuery for comments
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments,
    isError: isErrorComments
  } = useInfiniteQuery({
    queryKey: [postId, 'comments'],
    queryFn: ({ pageParam = 0 }) => 
      client.getPostComments({ postId: postId, offset: pageParam, take: 10 }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.offset + lastPage.pagination.take : undefined,
    initialPageParam: 0,
  })

  // Flatten all comments from all pages
  const allComments = data?.pages.flatMap(page => page.comments) ?? []

  const { data: post } = useQuery({
    queryKey: [postId, 'post'],
    queryFn: () => client.getPostById({ postId: postId})
  })

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)

  const lastCommentCallback = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingComments) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, {
      rootMargin: '100px' // Trigger 100px before reaching the element
    })
    
    if (node) observerRef.current.observe(node)
  }, [isLoadingComments, hasNextPage, fetchNextPage, isFetchingNextPage])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])
  return (
    <div className="flex gap-4 relative">
      <div className="border-1 rounded-3xl w-2xl border-stone-200 px-6 flex-1">
        <div className={`py-6 space-y-2`}>
          <h4 className="font-semibold capitalize text-lg">{post?.title}</h4>
          <p className="text-sm text-[#0007149f] font-medium capitalize text-pretty">{post?.content}</p>

          <div className='ml-auto flex max-w-max pt-6 gap-3'>
            <div>Co (4)</div>
            <div>Li (28)</div>
          </div>
        <div>

        <div className='bg-gray-50 p-4 rounded-2xl border border-stone-200 mt-6 flex flex-col items-end gap-3'>
          <AutosizeTextarea className='bg-gray-50 min-h-20 rounded-lg border-none' minHeight={100} placeholder='Add a comment...'/>
          <Button className='ml-auto rounded-lg'>
            Comment
          </Button>
        </div>
      </div>
    </div>
        
        {/* Comments loading state */}
        {isLoadingComments && allComments.length === 0 && (
          <div className="py-4 text-center">
            <div className="text-sm text-gray-500">Loading comments...</div>
          </div>
        )}
        
        {/* Comments error state */}
        {isErrorComments && (
          <div className="py-4 text-center">
            <div className="text-sm text-red-500">Error loading comments</div>
          </div>
        )}
        
        {/* Comments list */}
        {allComments.map((comment, i) => {
          const isSecondLastComment = i === allComments.length - 2
          
          return (
            <div 
              key={comment.id}
              ref={isSecondLastComment ? lastCommentCallback : null}
              className={'flex gap-1 py-4 space-y-2 w-full border-t-2'}
            >
              <div>
                <img src={comment.author?.image || 'https://picsum.photos/64'} alt="Avatar" className="w-8 h-8 rounded-full"/>
              </div>
              <div className='w-full'>
                <div className='flex gap-2 w-full'>
                  <h4>{comment.author?.name}</h4>
                  <span>{comment.createdAt.toLocaleDateString()}</span> 
                  <span className='ml-auto'>dots</span>
                </div>
                <div>
                  <p>{comment.content}</p>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Loading indicator for next page of comments */}
        {isFetchingNextPage && (
          <div className="py-4 text-center border-t-2">
            <div className="text-sm text-gray-500">Loading more comments...</div>
          </div>
        )}
        
        {/* End of comments indicator */}
        {!hasNextPage && allComments.length > 0 && (
          <div className="py-4 text-center border-t-2">
            <div className="text-sm text-gray-500">No more comments to load</div>
          </div>
        )}
        
        {/* No comments state */}
        {!isLoadingComments && allComments.length === 0 && (
          <div className="py-4 text-center border-t-2">
            <div className="text-sm text-gray-500">No comments yet. Be the first to comment!</div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 sticky top-6 h-fit ">
        <div className="border-1 bg-white z-10 rounded-2xl border-stone-200 shadow-2xs p-4 w-3xs">
          <div className='flex gap-3 items-center'>
            <div>
              { post?.author?.image ? <img src={post?.author.image} className='rounded-full h-8'/> : <span className='bg-gray-800 rounded-full'>A</span>}
            </div>
            <div>
              <h4 className="font-medium capitalize text-sm py-1"> {post?.author?.name}</h4>
              <p className='text-xs text-stone-600 pl-px'>{post?.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            { post?.board && 
            <div className='pt-4 pl-px'>
              <span className='pr-4 text-sm font-medium text-stone-600'>Board</span>
              <span className='bg-green-100 text-green-800 text-xs font-medium px-2 rounded-md p-1.5'> {post?.board.name}</span>
            </div>}
          </div>
          
        </div>
        <div className="border-1 bg-white z-10 rounded-2xl border-stone-200 shadow-2xs p-4">
          <h4 className="font-medium capitalize mb-2">Get Updates</h4>
          <Button variant={'secondary'} className='w-full border-1 border-stone-200 rounded-lg font-medium'>Subscribe</Button>
        </div>
      </div>
    </div>
  )
}
