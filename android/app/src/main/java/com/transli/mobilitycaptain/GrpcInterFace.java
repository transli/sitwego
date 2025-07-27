package com.transli.mobilitycaptain;

// import com.loopa.NotificationPayload;

import org.json.JSONException;

public interface GrpcInterFace {
    void onError(Throwable e);
    void onMessage(NotificationPayload notificationPayload);
    void onComplete();
}
