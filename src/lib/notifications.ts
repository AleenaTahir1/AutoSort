import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  registerActionTypes,
} from "@tauri-apps/plugin-notification";

let permissionChecked = false;
let hasPermission = false;
let registered = false;

async function ensurePermission(): Promise<boolean> {
  if (permissionChecked) {
    return hasPermission;
  }

  try {
    hasPermission = await isPermissionGranted();
    if (!hasPermission) {
      const permission = await requestPermission();
      hasPermission = permission === "granted";
    }
    permissionChecked = true;
    
    // Register action types for better notification handling
    if (hasPermission && !registered) {
      try {
        await registerActionTypes([{
          id: "autosort-notifications",
          actions: []
        }]);
        registered = true;
      } catch {
        // Registration may not be supported on all platforms
      }
    }
    
    return hasPermission;
  } catch (error) {
    console.error("Failed to check notification permission:", error);
    return false;
  }
}

export async function notifyFileMoved(
  fileName: string,
  destination: string
): Promise<void> {
  const allowed = await ensurePermission();
  if (!allowed) return;

  try {
    sendNotification({
      title: "AutoSort",
      body: `Moved: ${fileName} → ${destination}/`,
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

export async function notifyFilesMoved(count: number): Promise<void> {
  const allowed = await ensurePermission();
  if (!allowed) return;

  try {
    sendNotification({
      title: "AutoSort",
      body: `${count} file${count > 1 ? "s" : ""} organized successfully`,
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}
