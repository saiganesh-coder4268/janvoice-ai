type AvatarSize = "picker" | "profile" | "topbar";

export const GAME_AVATAR_IDS = Array.from({ length: 30 }, (_, index) =>
  `game-avatar-${String(index + 1).padStart(2, "0")}`
);

function getAvatarNumber(avatarId: string) {
  const avatarIndex = Number.parseInt(avatarId.replace("game-avatar-", ""), 10) - 1;
  return avatarIndex >= 0 && avatarIndex < GAME_AVATAR_IDS.length ? avatarIndex + 1 : 1;
}

export default function GameAvatar({
  avatarId,
  size,
  className = "",
}: {
  avatarId: string;
  size: AvatarSize;
  className?: string;
}) {
  const avatarNumber = getAvatarNumber(avatarId);

  return (
    <span
      aria-hidden="true"
      data-avatar-size={size}
      className={`block h-full w-full bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url('/avatars/game/avatar-${String(avatarNumber).padStart(2, "0")}.png')`,
      }}
    />
  );
}
