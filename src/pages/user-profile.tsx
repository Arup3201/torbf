import { useEffect, useState } from "react";

import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { Modal } from "../components/modal";
import { TopBar } from "../components/topbar";
import { ApiFetch } from "../utils/api";
import {
  MapUserProfile,
  type UserProfile,
  type UserProfileApi,
} from "../types/user";

type Option = {
  label: string;
  value: string;
};

const TIMEZONES: Option[] = [
  { label: "Honolulu (UTC-12:00)", value: "UTC-12:00" },
  { label: "Pago Pago (UTC-11:00)", value: "UTC-11:00" },
  { label: "Anchorage (UTC-10:00)", value: "UTC-10:00" },
  { label: "Los Angeles (UTC-09:00)", value: "UTC-09:00" },
  { label: "Vancouver (UTC-08:00)", value: "UTC-08:00" },
  { label: "Denver (UTC-07:00)", value: "UTC-07:00" },
  { label: "Chicago (UTC-06:00)", value: "UTC-06:00" },
  { label: "New York (UTC-05:00)", value: "UTC-05:00" },
  { label: "Santiago (UTC-04:00)", value: "UTC-04:00" },
  { label: "Buenos Aires (UTC-03:00)", value: "UTC-03:00" },
  { label: "Azores (UTC-02:00)", value: "UTC-02:00" },
  { label: "Cape Verde (UTC-01:00)", value: "UTC-01:00" },
  { label: "London (UTC+00:00)", value: "UTC+00:00" },
  { label: "Paris (UTC+01:00)", value: "UTC+01:00" },
  { label: "Cairo (UTC+02:00)", value: "UTC+02:00" },
  { label: "Moscow (UTC+03:00)", value: "UTC+03:00" },
  { label: "Dubai (UTC+04:00)", value: "UTC+04:00" },
  { label: "Kabul (UTC+04:30)", value: "UTC+04:30" },
  { label: "Karachi (UTC+05:00)", value: "UTC+05:00" },
  { label: "Mumbai (UTC+05:30)", value: "UTC+05:30" },
  { label: "Kathmandu (UTC+05:45)", value: "UTC+05:45" },
  { label: "Dhaka (UTC+06:00)", value: "UTC+06:00" },
  { label: "Yangon (UTC+06:30)", value: "UTC+06:30" },
  { label: "Bangkok (UTC+07:00)", value: "UTC+07:00" },
  { label: "Singapore (UTC+08:00)", value: "UTC+08:00" },
  { label: "Eucla (UTC+08:45)", value: "UTC+08:45" },
  { label: "Tokyo (UTC+09:00)", value: "UTC+09:00" },
  { label: "Adelaide (UTC+09:30)", value: "UTC+09:30" },
  { label: "Sydney (UTC+10:00)", value: "UTC+10:00" },
  { label: "Lord Howe (UTC+10:30)", value: "UTC+10:30" },
  { label: "Solomon Islands (UTC+11:00)", value: "UTC+11:00" },
  { label: "Auckland (UTC+12:00)", value: "UTC+12:00" },
  { label: "Chatham (UTC+12:45)", value: "UTC+12:45" },
  { label: "Nuku'alofa (UTC+13:00)", value: "UTC+13:00" },
  { label: "Kiritimati (UTC+14:00)", value: "UTC+14:00" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(2, "A");
}

export default function UserProfilePage() {
  const [profileInfo, setProfileInfo] = useState<UserProfile | null>(null);
  const [updatedProfileInfo, setUpdatedProfileInfo] =
    useState<UserProfile | null>(null);

  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editor, setEditor] = useState<
    "username" | "timezone" | "skills" | null
  >(null);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  async function getUserProfile() {
    try {
      const response = await ApiFetch("/profile");
      if (response.ok) {
        const respondeData = await response.json();
        const data: UserProfileApi = respondeData.data;
        setProfileInfo(MapUserProfile(data));
        setUpdatedProfileInfo(MapUserProfile(data));
      } else {
        throw new Error("Failed to get projects.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    getUserProfile();
  }, []);

  const parseSkills = (value: string) =>
    Array.from(
      new Set(
        value
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      ),
    );

  const allSkills = parseSkills(profileInfo?.skills || "");
  const visibleSkills = allSkills.slice(0, 4);
  const username = profileInfo?.username ? `@${profileInfo.username}` : "";

  const profileDetails = [
    { label: "Username", value: username, editable: true },
    { label: "Email", value: profileInfo?.email },
    {
      label: "Skills",
      value: visibleSkills,
      allValues: allSkills,
      editable: true,
    },
    {
      label: "Timezone",
      value: profileInfo?.timezone,
      editable: true,
    },
  ];

  const stats = [
    { label: "Projects", value: profileInfo?.projects || 0 },
    { label: "Tasks", value: profileInfo?.tasks || 0 },
    {
      label: "Completed",
      value:
        profileInfo?.tasks && profileInfo.tasks !== 0
          ? (profileInfo?.completedTasks / profileInfo?.tasks) * 100
          : "-",
    },
  ];

  const closeEditor = () => setEditor(null);

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswords({
      current: "",
      new: "",
      confirm: "",
    });
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  const savePassword = () => {
    if (!passwords.current.trim()) {
      return;
    }

    if (passwords.new.length < 8) {
      return;
    }

    if (passwords.new !== passwords.confirm) {
      return;
    }

    closePasswordModal();
  };

  const saveEditor = async () => {
    const update: Record<string, string | null> = {};

    if (editor === "username") {
      update.username = updatedProfileInfo?.username || null;
    }

    if (editor === "timezone") {
      update.timezone = updatedProfileInfo?.timezone || null;
    }

    if (editor === "skills") {
      update.skills = updatedProfileInfo?.skills || null;
    }

    try {
      const response = await ApiFetch("/users", {
        method: "PATCH",
        body: JSON.stringify(update),
      });
      if (response.ok) {
        setProfileInfo((prev) => {
          if (prev) {
            return {
              ...prev,
              ...update,
            };
          }

          return null;
        });
      } else {
        throw new Error("Failed to get projects.");
      }
    } catch (err) {
      console.error(err);
    }

    closeEditor();
  };

  let editorTitle = "";
  switch (editor) {
    case "username":
      editorTitle = "Edit username";
      break;
    case "timezone":
      editorTitle = "Edit timezone";
      break;
    case "skills":
      editorTitle = "Edit skills";
  }

  return (
    <>
      <TopBar title="Profile" />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-lg font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                  {getInitials(
                    profileInfo?.displayName || profileInfo?.username || "",
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-text-primary md:text-xl">
                    {profileInfo?.displayName || ""}
                  </h2>
                  <p className="text-sm text-text-muted">{username}</p>
                  <p className="mt-2 text-sm text-text-muted">
                    {profileInfo?.email}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
            <Card>
              <CardContent className="p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-text-muted">
                    Account details
                  </h3>
                </div>

                <dl className="space-y-3">
                  {profileDetails.map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <dt className="text-sm text-text-muted">
                          {item.label}
                        </dt>

                        {item.editable && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditor(
                                item.label.toLowerCase() as
                                  | "username"
                                  | "timezone"
                                  | "skills",
                              )
                            }
                            className="text-[11px] font-medium text-emerald-400 transition hover:text-emerald-300"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {item.label === "Skills" ? (
                        <dd className="w-full text-left sm:w-auto sm:text-right">
                          <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                            {(item.value as string[]).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs text-text-primary"
                              >
                                {skill}
                              </span>
                            ))}

                            {(item.allValues as string[]).length > 4 && (
                              <button
                                type="button"
                                onClick={() => setShowSkillsModal(true)}
                                className="text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
                              >
                                Show more
                              </button>
                            )}
                          </div>
                        </dd>
                      ) : (
                        <dd className="text-sm font-medium text-text-primary">
                          {item.label === "Timezone"
                            ? TIMEZONES.find((tz) => tz.value === item.value)
                                ?.label
                            : (item.value as string)}
                        </dd>
                      )}
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-text-muted">
                  Summary
                </h3>

                <div className="mt-4 space-y-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-md border border-border bg-bg-elevated px-3 py-2"
                    >
                      <span className="text-xs uppercase tracking-[0.08em] text-text-muted">
                        {stat.label}
                      </span>
                      <span className="text-base font-semibold text-text-primary">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={showSkillsModal}
        title="Skills"
        body={
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs text-text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSkillsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        }
      />

      <Modal
        open={showPasswordModal}
        title="Change password"
        body={
          <div className="p-4">
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "Current password",
                  value: passwords.current,
                  key: "current",
                  setter: (v: string) =>
                    setPasswords((prev) => ({ ...prev, current: v })),
                },
                {
                  label: "New password",
                  value: passwords.new,
                  key: "new",
                  setter: (v: string) =>
                    setPasswords((prev) => ({ ...prev, new: v })),
                },
                {
                  label: "Confirm password",
                  value: passwords.confirm,
                  key: "confirm",
                  setter: (v: string) =>
                    setPasswords((prev) => ({ ...prev, confirm: v })),
                },
              ].map((field) => {
                const isVisible =
                  showPasswords[field.key as keyof typeof showPasswords];

                return (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-secondary">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={isVisible ? "text" : "password"}
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder="••••••••"
                        className="h-9 w-full rounded-md border border-border bg-bg-elevated px-3 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:shadow-focus-primary"
                        autoComplete={
                          field.key === "current"
                            ? "current-password"
                            : "new-password"
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            [field.key]: !prev[field.key as keyof typeof prev],
                          }))
                        }
                        className="absolute inset-y-0 right-2 flex items-center text-text-muted transition hover:text-text-primary"
                        aria-label={
                          isVisible ? "Hide password" : "Show password"
                        }
                      >
                        {isVisible ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-none stroke-current"
                            strokeWidth="1.8"
                          >
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-none stroke-current"
                            strokeWidth="1.8"
                          >
                            <path d="M3 3l18 18" />
                            <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                            <path d="M9.88 5.08A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a16.7 16.7 0 0 1-4.04 5.13" />
                            <path d="M6.61 6.61A16.43 16.43 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 5.39-1.61" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={closePasswordModal}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={savePassword}
                disabled={
                  !passwords.current.trim() ||
                  passwords.new.length < 4 ||
                  passwords.new !== passwords.confirm
                }
              >
                Update
              </Button>
            </div>
          </div>
        }
      />

      <Modal
        open={editor !== null}
        title={editorTitle}
        body={
          <div className="p-4">
            {editor === "skills" && (
              <textarea
                value={updatedProfileInfo?.skills}
                onChange={(e) =>
                  setUpdatedProfileInfo((prev) => {
                    if (prev) {
                      return { ...prev, skills: e.target.value };
                    }

                    return null;
                  })
                }
                rows={4}
                className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:shadow-focus-primary"
                placeholder="C, Python, Java"
              />
            )}
            {editor === "username" && (
              <input
                autoFocus
                value={updatedProfileInfo?.username}
                onChange={(e) =>
                  setUpdatedProfileInfo((prev) => {
                    if (prev) {
                      return { ...prev, username: e.target.value };
                    }

                    return null;
                  })
                }
                className="h-9 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:shadow-focus-primary"
                placeholder="Enter username"
              />
            )}
            {editor === "timezone" && (
              <select
                value={updatedProfileInfo?.timezone}
                onChange={(e) =>
                  setUpdatedProfileInfo((prev) => {
                    if (prev) {
                      return { ...prev, timezone: e.target.value };
                    }

                    return null;
                  })
                }
                className="h-9 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:shadow-focus-primary"
              >
                {TIMEZONES.map((tz: Option) => (
                  <option
                    selected={tz.value === profileInfo?.timezone}
                    value={tz.value}
                  >
                    {tz.label}
                  </option>
                ))}
              </select>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={closeEditor}>
                Cancel
              </Button>
              <Button type="button" onClick={saveEditor}>
                Save
              </Button>
            </div>
          </div>
        }
      />
    </>
  );
}
