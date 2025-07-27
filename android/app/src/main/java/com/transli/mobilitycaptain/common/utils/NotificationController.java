package com.transli.mobilitycaptain.common.utils;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;

import com.transli.mobilitycaptain.OverlayPopUp;

import java.util.List;

public class NotificationController {
    public static void showPopUpNotification(Context context) {
        Intent popup_intent = new Intent(context, OverlayPopUp.class);
        try {
            if (!isAppInForeground(context)) {
                context.startService(popup_intent);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Helper method to check if the app is in the foreground
    private static boolean isAppInForeground(Context context) {
        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> processes = activityManager.getRunningAppProcesses();
        if (processes != null) {
            for (ActivityManager.RunningAppProcessInfo processInfo : processes) {
                if (processInfo.processName.equals(context.getPackageName()) &&
                        processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                    return true;
                }
            }
        }
        return false;
    }
}
