import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { tokenStore } from "../utils/token";
import { getValidToken } from "../utils/api";
import toast from "react-hot-toast";
import {
  ClipboardPlus,
  Pencil,
  UserPlus,
  UserMinus,
  DoorOpen,
  BadgeCheck,
  MessageSquare,
} from "lucide-react";
import type { Avatar } from "../types/avatar";

interface WSHook {
  url: string;
}

export interface ProjectBody {
  id: string;
  name: string;
}

export interface TaskBody {
  id: string;
  title: string;
}

export interface TaskUpdateBody {
  to: string;
  field: string;
}

export interface TaskAddedData {
  project: ProjectBody;
  task: TaskBody;
}

export interface TaskUpdatedData {
  project: ProjectBody;
  task: TaskBody;
  updates: TaskUpdateBody[];
  updater: Avatar;
}

export interface AssigneeUpdatedData {
  project: ProjectBody;
  task: TaskBody;
  assignee: Avatar;
}

export interface JoinRequestedData {
  project: ProjectBody;
  requestor: Avatar;
}

export interface JoinRespondedData {
  project: ProjectBody;
  responder: Avatar;
  status: string;
}

export interface CommentAddedData {
  project: ProjectBody;
  task: TaskBody;
  commenter: Avatar;
}

export interface TaskAddedNotification {
  type: "task_added";
  data: TaskAddedData;
}

export interface TaskUpdatedNotification {
  type: "task_updated";
  data: TaskUpdatedData;
}

export interface AssigneeAddedNotification {
  type: "assignee_added";
  data: AssigneeUpdatedData;
}

export interface AssigneeRemovedNotification {
  type: "assignee_removed";
  data: AssigneeUpdatedData;
}

export interface JoinRequestedNotification {
  type: "join_requested";
  data: JoinRequestedData;
}

export interface JoinRespondedNotification {
  type: "join_responded";
  data: JoinRespondedData;
}

export interface CommentAddedNotification {
  type: "comment_added";
  data: CommentAddedData;
}

export type RealtimeNotification =
  | TaskAddedNotification
  | TaskUpdatedNotification
  | AssigneeAddedNotification
  | AssigneeRemovedNotification
  | JoinRequestedNotification
  | JoinRespondedNotification
  | CommentAddedNotification;

function getNotificationInfo(notification: RealtimeNotification) {
  switch (notification.type) {
    case "task_added":
      return {
        icon: ClipboardPlus,
        title: "Task Added",
        message: `"${notification.data.task.title}" was added to ${notification.data.project.name}`,
      };

    case "task_updated":
      return {
        icon: Pencil,
        title: notification.data.updater.username,
        message: `Updated "${notification.data.task.title}"`,
        details: notification.data.updates
          .map((u) => `${u.field} → ${u.to}`)
          .join(", "),
      };

    case "assignee_added":
      return {
        icon: UserPlus,
        title: "Assignee Added",
        message: `${notification.data.assignee.username} was assigned to "${notification.data.task.title}"`,
      };

    case "assignee_removed":
      return {
        icon: UserMinus,
        title: "Assignee Removed",
        message: `${notification.data.assignee.username} was removed from "${notification.data.task.title}"`,
      };

    case "join_requested":
      return {
        icon: DoorOpen,
        title: notification.data.requestor.username,
        message: `Requested to join ${notification.data.project.name}`,
      };

    case "join_responded":
      return {
        icon: BadgeCheck,
        title: notification.data.responder.username,
        message:
          notification.data.status === "approved"
            ? `Approved your request to join ${notification.data.project.name}`
            : `Rejected your request to join ${notification.data.project.name}`,
      };

    case "comment_added":
      return {
        icon: MessageSquare,
        title: notification.data.commenter.username,
        message: `Commented on "${notification.data.task.title}"`,
      };

    default:
      return null;
  }
}

function useWebSocket({ url }: WSHook) {
  const wsRef = useRef<WebSocket | null>(null);
  const refreshToastID = useRef<string | null>(null);

  const connect = useCallback(() => {
    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      const token = tokenStore.get();
      socket.send(JSON.stringify({ type: "token", token: token }));
    };
    socket.onmessage = async (ev) => {
      const data = JSON.parse(ev.data);
      switch (data.type) {
        case "ack":
          if (refreshToastID.current) {
            toast.dismiss(refreshToastID.current);
            toast.success("You are connected to the server again");
          } else {
            toast.success("You are connected to the server");
          }
          break;
        case "refresh":
          refreshToastID.current = toast.loading(
            "Refreshing connection with the server",
          );
          await getValidToken();
          const token = tokenStore.get();
          socket.send(JSON.stringify({ type: "token", token: token }));
          break;
        default:
          const notification = getNotificationInfo(data);

          if (!notification) return;

          const Icon = notification.icon;

          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "animate-custom-enter" : "animate-custom-leave"
                } max-w-md w-full rounded-xl border border-border-default bg-bg-elevated shadow-2xl backdrop-blur-sm`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted text-primary)]">
                        {" "}
                        <Icon size={18} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {notification.title}
                        </p>
                      </div>

                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                        {notification.message}
                      </p>

                      {notification.details && (
                        <div className="mt-2 rounded-md border border-border-muted bg-bg-surface px-2 py-1">
                          <p className="text-xs text-text-muted">
                            {notification.details}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="rounded-md p-1 text-text-muted transition-colors hover:bg-bg-overlay hover:text-text-primary"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ),
            {
              duration: 5000,
            },
          );
      }
    };
    socket.onerror = (ev) => {
      console.log("Websocket error: ", ev);
    };
    socket.onclose = () => {
      console.log("Websocket closed");
      toast.error("You are disconnected from the server");
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close(1000, "hook cleanup");
    };
  }, [connect]);

  return { wsRef };
}

interface WSProvider {
  url: string;
  children: React.ReactNode;
}

interface WSContext {
  wsRef: React.RefObject<WebSocket | null>;
}

const WebSocketContext = createContext<WSContext | null>(null);

const WebSocketProvider: React.FC<WSProvider> = ({ url, children }) => {
  const ws = useWebSocket({ url });

  return (
    <WebSocketContext.Provider value={{ ...ws }}>
      {children}
    </WebSocketContext.Provider>
  );
};

function useSocket() {
  return useContext(WebSocketContext);
}

export { WebSocketProvider, useSocket };
