interface AvatarProps {
  user: {
    username: string;
    avatarUrl: string | undefined;
  } | null;
}

// _TODO: add a conditional check and fix double-user
export default function UserAvatar(user: AvatarProps) {
  return (
    <div className="flex gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={user.user?.avatarUrl}
        alt={`${user?.user?.username}'s profile image`}
        className="size-5 rounded-full"
      />
      <p>{user?.user?.username}</p>
    </div>
  );
}
