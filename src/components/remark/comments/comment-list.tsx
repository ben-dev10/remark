"use client";
import { api } from "@/convex/_generated/api";
import { CommentWithUser } from "@/utils/types/convex";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useOptimisticAuth } from "@/hooks/use-optimistic-auth";
import {
  AlertCircle,
  ChevronDown,
  RefreshCw,
  Wifi,
  WifiOff,
  Lock,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { storageManager } from "@/utils/lib/storage";
import { CommentSortSelector, SortOption } from "./ui";
import { sortComments } from "./comment-sorting";
import { CommentThread, organizeCommentsIntoThreads } from "./comment-thread";
import { COMMENTS_CONFIG, isApproachingLimit } from "./config/comments";
import { useOnline } from "@/hooks/use-online";
import { Callout } from "fumadocs-ui/components/callout";
import ChatIcon from "@/icons/chat-icon";

type PaginatedResponse = {
  total?: number;
  hasMore?: boolean;
  totalTopLevel?: number;
};

type CommentsStatus = {
  isLocked?: boolean;
  remaining?: number;
};

interface CommentListProps {
  postId: string;
  onStatusChange?: (status: { isLocked: boolean }) => void;
}

export default function CommentsList({
  postId,
  onStatusChange,
}: CommentListProps) {
  const { user } = useOptimisticAuth();
  const currentUserId = user?.id;

  const isOnline = useOnline();
  const [cachedComments, setCachedComments] = useState<
    CommentWithUser[] | null
  >(null);

  const [enableQuery, setEnableQuery] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    if (typeof window === "undefined") return "newest";
    const saved = localStorage.getItem("comment_sort_preference");
    return (saved as SortOption) || "newest";
  });

  const [loadedCount, setLoadedCount] = useState<number>(
    COMMENTS_CONFIG.PAGE_SIZE,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("comment_sort_preference", sortBy);
    }
  }, [sortBy]);

  const result = useQuery(
    api.comments.comments.getPaginatedComments,
    isOnline && enableQuery
      ? {
          postId,
          limit: loadedCount,
          offset: 0,
        }
      : "skip",
  );

  const accumulatedComments = result?.comments as CommentWithUser[] | undefined;
  const pagination = result?.pagination as PaginatedResponse | undefined;
  const status = result?.status as CommentsStatus | undefined;

  // Preserve the last-known live values when refetching
  const [liveComments, setLiveComments] = useState<
    CommentWithUser[] | null | undefined
  >(undefined);
  const [livePagination, setLivePagination] = useState<
    PaginatedResponse | undefined
  >(undefined);
  const [liveStatus, setLiveStatus] = useState<CommentsStatus | undefined>(
    undefined,
  );

  /*
   * useEffects to maintain current list and append new items without re-rendering comment-list
   * when loading more comments.
   */
  useEffect(() => {
    if (accumulatedComments !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveComments(accumulatedComments);
    }
  }, [accumulatedComments]);

  useEffect(() => {
    if (pagination !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLivePagination(pagination);
    }
  }, [pagination]);

  useEffect(() => {
    if (status !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveStatus(status);
    }
  }, [status]);

  useEffect(() => {
    const current = status ?? liveStatus;
    if (current) {
      onStatusChange?.({ isLocked: !!current.isLocked });
    }
  }, [status, liveStatus, onStatusChange]);
  //------------------------

  useEffect(() => {
    const cached = storageManager.getCachedComments(postId);
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCachedComments(cached);
    }
  }, [postId]);

  // update cache when live data arrives
  useEffect(() => {
    if (accumulatedComments && accumulatedComments.length > 0) {
      storageManager.cacheComments(postId, accumulatedComments);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCachedComments(accumulatedComments);
    }
  }, [accumulatedComments, postId]);

  const handleRetry = () => {
    setEnableQuery(false);
    setTimeout(() => setEnableQuery(true), 0);
  };

  const handleLoadMore = () => {
    setLoadedCount((prev) => prev + COMMENTS_CONFIG.PAGE_SIZE);
  };

  const comments = isOnline
    ? (accumulatedComments ?? liveComments)
    : cachedComments;

  // CASE 1: Not connected to internet
  if (!isOnline && !cachedComments) {
    return (
      <div className="_comments-list min-h-30 mb-20 mt-15 p-5">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <WifiOff className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Internet Connection
          </h3>
          <p className="text-muted-foreground mb-4">
            Please check your connection and try again.
          </p>
          <Button
            onClick={handleRetry}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!isOnline}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // CASE 2: Loading (connected, waiting for data, no cache)
  if (comments === undefined && !cachedComments) {
    return (
      <div className="_comments-list min-h-30 mt-15 p-5">
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        </div>
      </div>
    );
  }

  // CASE 3: No comments
  if (comments === null || (Array.isArray(comments) && comments.length === 0)) {
    return (
      <div className="_comments-list min-h-30 py-20 p-5 relative">
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="mb-1">
              <ChatIcon className="size-12 rotate-5 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Comments
            </h3>
            <p className="text-muted-foreground">
              There are no comments yet. Be the first to comment!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CASE 4: Comments loaded (live or cached)
  const displayComments = comments || [];

  const { topLevel, repliesMap } = organizeCommentsIntoThreads(displayComments);
  const sortedTopLevel = sortComments(topLevel, sortBy, repliesMap);

  const effectivePagination = pagination ?? livePagination;
  const effectiveStatus = status ?? liveStatus;

  const totalComments = effectivePagination?.total || displayComments.length;
  const isLocked = effectiveStatus?.isLocked || false;
  const hasMore = effectivePagination?.hasMore || false;
  const showWarning = isApproachingLimit(totalComments);

  return (
    <div className="_comments-list min-h-30 mt-5">
      {!isOnline && (
        <div className="_offline-badge ml-auto mb-6 top-2 z-10 flex max-w-max items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-400 text-sm rounded-lg">
          <WifiOff className="w-4 h-4" />
          <span className="flex-1">
            {cachedComments
              ? "You're offline. Showing cached comments."
              : "You're offline. Comments will sync when you reconnect."}
          </span>
          {isOnline && (
            <div className="flex items-center ml-8 gap-1 text-green-600 dark:text-green-300">
              <Wifi className="w-4 h-4" />
              <span className="text-xs">Reconnecting...</span>
            </div>
          )}
        </div>
      )}

      {isLocked && (
        <Callout
          title="Discussion Locked"
          type="error"
          className="_locked-notice text-red-700 dark:text-red-400"
          icon={<Lock className="size-4 text-red-700 dark:text-red-400" />}
        >
          <p className="text-sm ">
            This discussion has reached the maximum of{" "}
            {COMMENTS_CONFIG.MAX_COMMENTS_PER_POST} comments and is now
            read-only.
          </p>
        </Callout>
      )}

      {!isLocked && showWarning && effectiveStatus && (
        <Callout
          title="Approaching Limit"
          type="warn"
          className="_locked-notice text-orange-700 dark:text-orange-400"
          icon={
            <AlertCircle className="size-4 text-orange-700 dark:text-orange-400" />
          }
        >
          <p className="text-sm ">
            This discussion is approaching the maximum comment limit.{" "}
            <span className="font-semibold">{effectiveStatus.remaining}</span>{" "}
            comments remaining.
          </p>
        </Callout>
      )}

      {displayComments.length > COMMENTS_CONFIG.ARCHIVE_DISPLAY_THRESHOLD && (
        <Callout
          title="Archived Discussion"
          type="info"
          className="_archived-notice text-blue-700 dark:text-blue-400"
          icon={<Archive className="size-4 text-blue-700 dark:text-blue-400" />}
        >
          <p className="text-sm ">
            This is a large discussion with {totalComments} comments. Showing
            the most recent {displayComments.length} comments.
          </p>
        </Callout>
      )}

      <CommentSortSelector
        value={sortBy}
        onChange={setSortBy}
        totalComments={totalComments}
      />

      <div
        className={`_comments+actions rounded-3xl min-h-30 p-1.5 rounded-[calc(1rem+0.375rem)] dark:bg-black/50 bg-neutral-100`}
      >
        <div
          className={`_comments pb-15 border dark:border-white/5 border-white ring-[1px] ring-[#191C21]/5 dark:ring-black/20 shadow-[0_1px_2px_0_rgba(25,28,33,.06),0_0_2px_0_--theme(--color-black/.08)] 
            dark:shadow-[inset_0_0_1px_1px_--theme(--color-white/.01),0_1px_3px_0_--theme(--color-black/.4),0_0_3px_0_--theme(--color-black/.2)] dark:bg-[#0c0c0c] rounded-[1rem] bg-[#fdfdfd] p-4 flex flex-col space-y-3`}
        >
          {sortedTopLevel.map((comment) => (
            <CommentThread
              key={comment._id}
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
              repliesMap={repliesMap}
              depth={0}
              isLocked={isLocked}
            />
          ))}
        </div>

        <div className="_bottom-actions p-4 pb-3">
          {hasMore && (
            <div className="_load-more flex justify-center">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Load More Comments (
                {effectivePagination?.totalTopLevel && sortedTopLevel.length
                  ? effectivePagination.totalTopLevel - sortedTopLevel.length
                  : 0}{" "}
                remaining)
              </Button>
            </div>
          )}

          {!hasMore && displayComments.length > 0 && (
            <div className="_end-of-comments text-center text-sm text-muted-foreground">
              <p>End of comments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
