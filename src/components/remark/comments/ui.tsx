"use client";
import { ArrowUpDown, TrendingUp, Clock, MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SpinnerRing180 from "@/icons/180-spinner";
import { COMMENTS_CONFIG } from "./config/comments";

export type SortOption =
  | "newest"
  | "oldest"
  | "most-replies"
  | "recently-updated";

interface CommentSortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  totalComments: number;
}

export function CommentSortSelector({
  value,
  onChange,
  totalComments,
}: CommentSortSelectorProps) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-muted-foreground" />
        <span className="font-semibold text-foreground">
          {totalComments}{" "}
          <span className="text-muted-foreground">
            {totalComments === 1 ? "Comment" : "Comments"}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-45 h-9">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Newest First</span>
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 rotate-180" />
                <span>Oldest First</span>
              </div>
            </SelectItem>
            <SelectItem value="most-replies">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Most Replies</span>
              </div>
            </SelectItem>
            <SelectItem value="recently-updated">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Recently Updated</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface DeleteCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteCommentDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteCommentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[1.3rem]">
            Delete Comment
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this comment? This action cannot be
            undone.
            <span className="block mt-5 text-xs text-muted-foreground">
              <b>Note:</b> Replies to this comment will remain visible.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:text-white"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1">
                <SpinnerRing180 className="size-4.5" /> Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DiscardChangesProp {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DiscardChangesDialog({
  open,
  onOpenChange,
  onConfirm,
}: DiscardChangesProp) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[1.3rem]">
            Discard Changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Discard them?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 hover:bg-red-700 dark:text-white"
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type CircularCounterProps = {
  current: number;
  isOverLimit: boolean;
  isNearLimit: boolean;
};

export function CharacterCounter({
  current,
  isOverLimit,
  isNearLimit,
}: CircularCounterProps) {
  return (
    <>
      {current > 0 && (
        <span
          className={`_character-counter text-xs ${
            isOverLimit
              ? "text-red-600 dark:text-red-400 font-semibold"
              : isNearLimit
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-muted-foreground"
          }`}
        >
          {current}/{COMMENTS_CONFIG.MAX_CHARACTERS}
        </span>
      )}
    </>
  );
}

type CircularCounterProps2 = {
  current: number;
  isOverLimit: boolean;
  isNearLimit: boolean;
  max?: number;
  size?: number;
  strokeWidth?: number;
};

export function CharacterCounter2({
  current,
  max = COMMENTS_CONFIG.MAX_CHARACTERS,
  size = 18,
  strokeWidth = 2,
  isOverLimit,
  isNearLimit,
}: CircularCounterProps2) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / max, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <>
      {current > 0 && (
        <div className=" flex items-center justify-center">
          {isOverLimit && (
            <small className=" text-red-600 dark:text-red-400 mr-2">
              {max - current}
            </small>
          )}

          <svg width={size} height={size} className="-rotate-90">
            {/* background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              className="text-muted-foreground/20"
              strokeWidth={strokeWidth}
            />

            {/* progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              className={
                isOverLimit
                  ? "text-red-600 dark:text-red-400"
                  : isNearLimit
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-muted-foreground"
              }
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 150ms linear",
              }}
              stroke="currentColor"
            />
          </svg>
        </div>
      )}
    </>
  );
}
