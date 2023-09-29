import type { User } from "discord.js";

export function hasAccess({
  role,
  user,
}: {
  role: "admin" | "public";
  user: User;
}) {
  console.log('-----------', user.tag, user.username)
  switch (role) {
    case "public":
      return true;
    case "admin":
      return false;
    default:
      return false;
  }
}
