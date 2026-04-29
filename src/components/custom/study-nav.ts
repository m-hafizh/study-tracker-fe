import type { IconType } from "react-icons";
import {
  LuBookOpen,
  LuCalendarDays,
  LuClipboardList,
  LuFolderKanban,
  LuLayoutDashboard,
  LuListChecks,
  LuSettings,
  LuTimer,
  LuUserRound,
} from "react-icons/lu";

export type StudyNavItem = {
  label: string;
  route: string;
  icon: IconType;
  end?: boolean;
};

export type StudyNavGroup = {
  title: string;
  items: StudyNavItem[];
};

export const studyNavGroups: StudyNavGroup[] = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", route: "/study-tracker", icon: LuLayoutDashboard, end: true },
      { label: "Calendar", route: "/study-tracker/calendar", icon: LuCalendarDays },
      { label: "Kanban", route: "/study-tracker/kanban", icon: LuFolderKanban },
      { label: "Study Session", route: "/study-tracker/study-session", icon: LuBookOpen },
    ],
  },
  {
    title: "Records",
    items: [
      { label: "History", route: "/study-tracker/history", icon: LuClipboardList },
      { label: "Subject", route: "/study-tracker/subject", icon: LuListChecks },
    ],
  },
  {
    title: "Tools",
    items: [{ label: "Pomodoro", route: "/study-tracker/pomodoro", icon: LuTimer }],
  },
];

export const studySecondaryNavItems: StudyNavItem[] = [
  { label: "Settings", route: "/study-tracker/settings", icon: LuSettings },
];

export const studyNavItems = [
  ...studyNavGroups.flatMap((group) => group.items),
  ...studySecondaryNavItems,
  { label: "Change Password", route: "/study-tracker/change-password", icon: LuSettings },
  { label: "Profile", route: "/study-tracker/profile", icon: LuUserRound },
];
