import { api } from "@/convex/_generated/api";
import { CommentWithUser } from "@/utils/types/convex";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import Comment from "./comment";
import { useOptimisticAuth } from "@/hooks/use-optimistic-auth";
import { useOnline } from "@/hooks/use-online";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storageManager } from "@/utils/lib/storage";
import { mockData } from "@/utils/lib/mock-comments-data";

interface CommentListProps {
  postId: string;
}

const retryTimeout = 15000;

export default function CommentsList({ postId }: CommentListProps) {
  const { user } = useOptimisticAuth();
  const currentUserId = user?.id;
  const isOnline = useOnline();

  // network state management
  const [hasEverFetched, setHasEverFetched] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [showOfflineBadge, setShowOfflineBadge] = useState(false);
  const [cachedComments, setCachedComments] = useState<
    CommentWithUser[] | null
  >(null);
  const [enableQuery, setEnableQuery] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // main query to db
  const liveComments = useQuery(
    api.comments.comments.getCommentsByPost,
    isOnline && enableQuery ? { postId } : "skip",
  ) as CommentWithUser[] | null | undefined;

  // const liveComments = mockData;

  // Load cached comments on mount
  useEffect(() => {
    const cached = storageManager.getCachedComments(postId);
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCachedComments(cached);
      setHasEverFetched(true); // Mark as fetched if we have cache
    }
  }, [postId]);

  // Update cache when live data arrives
  useEffect(() => {
    if (liveComments !== undefined && liveComments !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasEverFetched(true);
      setIsTimeout(false);

      // Cache the fresh data
      storageManager.cacheComments(postId, liveComments);
      setCachedComments(liveComments);

      // Clear timeout timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [liveComments, postId]);

  // Set timeout for fetch (15 seconds)
  useEffect(() => {
    if (!isOnline) return;

    // Only set timeout if we're loading and haven't fetched before
    if (liveComments === undefined && !hasEverFetched) {
      timeoutRef.current = setTimeout(() => {
        setIsTimeout(true);
      }, retryTimeout); // 15 second timeout
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [liveComments, isOnline, hasEverFetched]);

  // Show offline badge if user goes offline after fetching data
  useEffect(() => {
    if (!isOnline && hasEverFetched) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOfflineBadge(true);
    } else {
      setShowOfflineBadge(false);
    }
  }, [isOnline, hasEverFetched]);

  // Handle retry - briefly disable then re-enable query to force refresh
  const handleRetry = () => {
    setIsTimeout(false);
    setEnableQuery(false);
    // Re-enable on next tick to trigger fresh query
    setTimeout(() => setEnableQuery(true), 0);
  };

  // Determine which comments to display
  const comments = isOnline ? liveComments : cachedComments;

  // CASE 1: Not connected to internet (first time, no cached data)
  if (!isOnline && !hasEverFetched && !cachedComments) {
    return (
      <div className="_comments-list min-h-30 border p-5">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <WifiOff className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
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
      <div className="_comments-list min-h-30 border p-5">
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-gray-500">Loading comments...</p>
          </div>
        </div>
      </div>
    );
  }

  // CASE 4: No comments
  if (comments === null || (Array.isArray(comments) && comments.length === 0)) {
    return (
      <div className="_comments-list min-h-30 border p-5 relative">
        {/* Offline badge */}
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

  return (
    <div className="_comments-list min-h-30 border p-5">
      {/* Offline badge - shown when user goes offline after fetching */}
      {showOfflineBadge && (
        <div className="sticky top-2 z-10 mb-4 flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg">
          <WifiOff className="w-4 h-4" />
          <span className="flex-1">
            {cachedComments
              ? "You're offline. Showing cached comments."
              : "You're offline. Comments will sync when you reconnect."}
          </span>
          {isOnline && (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-xs">Reconnecting...</span>
            </div>
          )}
        </div>
      )}

      <div className="_comments flex flex-col gap-6">
        {displayComments.map((c) => (
          <Comment
            key={c._id}
            comment={c}
            postId={postId}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
