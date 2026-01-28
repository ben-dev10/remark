"use client";
import { api } from "@/convex/_generated/api";
import { CommentWithUser } from "@/utils/types/convex";
import { useEffect, useRef, useState } from "react";
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

interface CommentListProps {
  postId: string;
}

const retryTimeout = 15000; // 15 second timeout

export default function CommentsList({ postId }: CommentListProps) {
  const { user } = useOptimisticAuth();
  const currentUserId = user?.id;
  const isOnline = useOnline();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // network state management
  const [hasEverFetched, setHasEverFetched] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [showOfflineBadge, setShowOfflineBadge] = useState(false);
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
  const pagination = result?.pagination;
  const status = result?.status;

  useEffect(() => {
    const cached = storageManager.getCachedComments(postId);
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCachedComments(cached);
      setHasEverFetched(true);
    }
  }, [postId]);

  // update cache when live data arrives
  useEffect(() => {
    if (accumulatedComments && accumulatedComments.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasEverFetched(true);
      setIsTimeout(false);

      storageManager.cacheComments(postId, accumulatedComments);
      setCachedComments(accumulatedComments);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [accumulatedComments, postId]);

  useEffect(() => {
    if (!isOnline) return;

    // Only set timeout if we're loading and haven't fetched before
    if (accumulatedComments?.length === 0 && !hasEverFetched) {
      timeoutRef.current = setTimeout(() => {
        setIsTimeout(true);
      }, retryTimeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [accumulatedComments, isOnline, hasEverFetched]);

  // show offline badge if user goes offline after fetching data
  useEffect(() => {
    if (!isOnline && hasEverFetched) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOfflineBadge(true);
    } else {
      setShowOfflineBadge(false);
    }
  }, [isOnline, hasEverFetched]);

  const handleRetry = () => {
    setIsTimeout(false);
    setEnableQuery(false);
    setTimeout(() => setEnableQuery(true), 0);
  };

  const handleLoadMore = () => {
    setLoadedCount((prev) => prev + COMMENTS_CONFIG.PAGE_SIZE);
  };
  const comments = isOnline ? accumulatedComments : cachedComments;

  // CASE 1: Not connected to internet (first time, no cached data)
  if (!isOnline && !hasEverFetched && !cachedComments) {
    return (
      <div className="_comments-list min-h-30 mt-20 p-5">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <WifiOff className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Internet Connection
          </h3>
          <p className="text-gray-500 mb-4">
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

  // ❌ FIX
  // if (!isOnline && cachedComments) {
  //   return (
  //     <div className="pt-5">
  //       <div className="sticky top-2 z-10 mb-4 flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg">
  //         <WifiOff className="w-4 h-4" />
  //         <span className="flex-1">
  //           {cachedComments
  //             ? "You're offline. Showing cached comments."
  //             : "You're offline. Comments will sync when you reconnect."}
  //         </span>
  //         {isOnline && (
  //           <div className="flex items-center gap-1 text-green-600">
  //             <Wifi className="w-4 h-4" />
  //             <span className="text-xs">Reconnecting...</span>
  //           </div>
  //         )}
  //       </div>

  //       <div className="flex flex-col gap-6 px-5">
  //         {cachedComments.map((c) => (
  //           <Comment
  //             key={c._id}
  //             comment={c}
  //             postId={postId}
  //             currentUserId={currentUserId}
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  // CASE 2: Connection timeout (connected but taking too long)
  if (isTimeout && !hasEverFetched) {
    return (
      <div className="_comments-list min-h-30 border p-5">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Connection Timeout
          </h3>
          <p className="text-gray-500 mb-4">
            Taking longer than expected to load comments. This might be due to
            slow connection.
          </p>
          <Button
            onClick={handleRetry}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // CASE 3: Loading (connected, waiting for data, no cache)
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

  // CASE 4: No comments
  if (comments === null || (Array.isArray(comments) && comments.length === 0)) {
    return (
      <div className="_comments-list min-h-30 border p-5 relative">
        {showOfflineBadge && (
          <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            <WifiOff className="w-3 h-3" />
            Offline
          </div>
        )}

        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        </div>
      </div>
    );
  }

  // CASE 5: Comments loaded (live or cached)
  const displayComments = comments || [];

  // Organize into threads and sort
  const { topLevel, repliesMap } = organizeCommentsIntoThreads(displayComments);
  const sortedTopLevel = sortComments(topLevel, sortBy, repliesMap);

  const totalComments = pagination?.total || displayComments.length;
  const isLocked = status?.isLocked || false;
  const hasMore = pagination?.hasMore || false;
  const showWarning = isApproachingLimit(totalComments);

  return (
    <div className="_comments-list min-h-30 mt-5 p-5">
      {!isOnline && (
        <div className="sticky ml-auto mb-6 top-2 z-10 flex max-w-max items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-400 text-sm rounded-lg">
          <WifiOff className="w-4 h-4" />
          <span className="flex-1">
            {cachedComments
              ? "You're offline. Showing cached comments."
              : "You're offline. Comments will sync when you reconnect."}
          </span>
          {isOnline && (
            <div className="flex items-center ml-8 gap-1 text-green-600 dark:text-green-300">
              <Wifi className="w-4 h-4" />
              <span className="text-xs">Trying to reconnect...</span>
            </div>
          )}
        </div>
      )}

      {isLocked && (
        <div className="_locked-notice mb-4 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <Lock className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900">Discussion Locked</h4>
            <p className="text-sm text-red-700">
              This discussion has reached the maximum of{" "}
              {COMMENTS_CONFIG.MAX_COMMENTS_PER_POST} comments and is now
              read-only.
            </p>
          </div>
        </div>
      )}

      {!isLocked && showWarning && status && (
        <div className="_warning-notice mb-4 flex items-start gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900">Approaching Limit</h4>
            <p className="text-sm text-yellow-700">
              This discussion is approaching the maximum comment limit.{" "}
              <span className="font-semibold">{status.remaining}</span> comments
              remaining.
            </p>
          </div>
        </div>
      )}

      {displayComments.length > COMMENTS_CONFIG.ARCHIVE_DISPLAY_THRESHOLD && (
        <div className="_archive-notice mb-4 flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Archive className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900">Archived Discussion</h4>
            <p className="text-sm text-blue-700">
              This is a large discussion with {totalComments} comments. Showing
              the most recent {displayComments.length} comments.
            </p>
          </div>
        </div>
      )}

      <CommentSortSelector
        value={sortBy}
        onChange={setSortBy}
        totalComments={totalComments}
      />

      <div className="_comments-thread flex flex-col gap-6">
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

      {hasMore && !isLocked && (
        <div className="_load-more mt-6 flex justify-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronDown className="w-4 h-4" />
            Load More Comments (
            {pagination?.totalTopLevel && sortedTopLevel.length
              ? pagination.totalTopLevel - sortedTopLevel.length
              : 0}{" "}
            remaining)
          </Button>
        </div>
      )}

      {!hasMore && displayComments.length > 0 && (
        <div className="_end-of-comments mt-10 text-center text-sm text-gray-500">
          <p>End of comments</p>
        </div>
      )}
    </div>
  );
}
