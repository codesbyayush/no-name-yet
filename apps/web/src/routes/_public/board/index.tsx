import { Button } from "@/components/ui/button";
import { getFeedbacks } from "@/lib/utils";
import { client } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute, redirect } from "@tanstack/react-router";

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
import { useState } from "react";

export const Route = createFileRoute("/_public/board/")({
  component: BoardIndexPage,
});

function BoardIndexPage() {
  const AllFeedbacks = getFeedbacks()
  const navigate = useNavigate({ from: '/board' })
  const { data: posts } = useQuery({
    queryKey: ['all-posts'],
    queryFn: () => client.getOrganizationPosts({ offset: 0, take: 10})
  })
    const [position, setPosition] = useState("bottom");

  const { data } = useQuery({
    queryKey: ["boards"],
    queryFn: () => client.getAllPublicBoards(),
  });
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
        {posts?.posts.map((f, i) => (
          <div onClick={() => navigate({
            to: f.id
          })} key={i} className={`${i > 0 ? 'border-t-2' : ''} py-4 space-y-2`}>
            <h4 className="font-semibold text-lg">{f.title}</h4>
            <p className="text-sm text-[#0007149f]">{f.content}</p>
            <div>
              <div>icon, name, date</div>
              <div>status, comms, likes</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 sticky top-0 h-fit">
        <div className="border-1 p-4 bg-white z-10">
          <div>
            Got an idea
          </div>
          <Button>
            Submit a post
          </Button>
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
