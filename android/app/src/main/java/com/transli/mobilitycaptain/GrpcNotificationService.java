package com.transli.mobilitycaptain;

import static io.grpc.Metadata.ASCII_STRING_MARSHALLER;

import android.app.Service;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;


import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.transli.mobilitycaptain.common.utils.NotificationController;

import java.util.concurrent.TimeUnit;

import io.grpc.CallOptions;
import io.grpc.Channel;
import io.grpc.ClientCall;
import io.grpc.ClientInterceptor;
import io.grpc.ForwardingClientCall;
import io.grpc.ManagedChannel;
import io.grpc.Status;
import io.grpc.android.AndroidChannelBuilder;
import io.grpc.Metadata;
import io.grpc.MethodDescriptor;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;

public class GrpcNotificationService extends Service implements GrpcInterFace{
    public static final String TAG = GrpcNotificationService.class.getName();
    public static final String TOKEN_KEY = "TOKEN_KEY";
    private String token;
    private static NotificationGrpc.NotificationStub asyncStub;
    private ManagedChannel channel = null;
    private boolean isStarted = false;

    private ReactApplicationContext reactContext = null;
    private DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        reactContext = GeoKalmanModule.getReactAppContext();
        this.eventEmitter = reactContext.getJSModule(
                DeviceEventManagerModule.RCTDeviceEventEmitter.class
        );
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "Destroying GRPC service");
        shutDown();
        stopSelf();
    }

    private boolean isChannelShutdown() {
        return channel == null || channel.isShutdown() || channel.isTerminated();
    }

    // Override the finalize() method to ensure cleanup when the object is garbage collected
    @Override
    protected void finalize() throws Throwable {
        try {
            shutDown();
        } finally {
            super.finalize();
        }
    }

    private void shutDown() {
        this.isStarted = false;
        if (!isChannelShutdown()) {
            channel.shutdownNow();
            channel = null;
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.hasExtra(TOKEN_KEY)) {
            this.token = intent.getStringExtra(TOKEN_KEY);
            initGrpc(this.token);
        } else {
            Log.w(TAG, "No token received in onStartCommand");
        }
        //return START_STICKY; // Adjust as per your service behavior START_STICKY
        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onError(Throwable e) {
        if (e instanceof StatusRuntimeException statusRuntimeException){
            if ((statusRuntimeException.getStatus().getCode() == Status.Code.INTERNAL) &&
                    (statusRuntimeException.getStatus().getDescription() != null &&
                            containsAny(statusRuntimeException.getStatus().getDescription(), new String[]{"UNAUTHENTICATED", "UNAVAILABLE", "Rst Stream", "TIMEOUT", "RETRY"}))) {
                Log.e("GRPC", "[Retrying]");
                shutDown();
                initGrpc(token);
            }

            Log.e("GRPC CONNECTION", "[Error] : " + e);
        }
    }


    private boolean containsAny(String description, String[] substrings) {
        if (description == null) {
            return false;
        }
        for (String substring : substrings) {
            if (description.contains(substring)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void onMessage(NotificationPayload notificationPayload) {
        if (this.eventEmitter != null){
            Log.i(TAG, "[Incoming Notification]" + notificationPayload.getEntity().getType());
            WritableMap msg = Arguments.createMap();
            //                    entity: None,
            msg.putString("id", notificationPayload.getId());
            msg.putString("category", notificationPayload.getCategory());
            msg.putString("type", notificationPayload.getEntity().getType());
            msg.putString("entity_id", notificationPayload.getEntity().getId());
            msg.putString("data", notificationPayload.getEntity().getData());
            this.eventEmitter.emit("onRideReqMessage", msg);
            MediaPlayer mp = MediaPlayer.create(getApplicationContext(), R.raw.silent_notif);
            NotificationController.showPopUpNotification(this);
            if (mp != null) mp.start();
        }
    }

    @Override
    public void onComplete() {
        shutDown();
        initGrpc(token);
    }


    private void initGrpc (String token) {
        Log.d(TAG, "Initializing GRPC Connection for Token: " + token);
        if(token == null){
            Log.w(TAG, "Token is null");
            onDestroy();
            return;
        }
        if (isChannelShutdown()) {
            createChannel(token);
            startGRPCNotificationService();
        } else {
            Log.w(TAG, "Channel is not shutdown");
        }
    }

    private void createChannel(String token) {
        channel = AndroidChannelBuilder.forTarget("localhost:8080")
                .intercept(new GRPCNotificationHeaderInterceptor(token))
                .usePlaintext()
                .keepAliveTime(30, TimeUnit.SECONDS)
                .keepAliveTimeout(20, TimeUnit.SECONDS)
                .keepAliveWithoutCalls(true)
                .maxRetryAttempts(10)
                .enableRetry()
                .maxInboundMessageSize(1024 * 1024)
                .build();
        asyncStub = NotificationGrpc.newStub(channel);
    }

    private void startGRPCNotificationService() {
        GRPCNotificationResponseObserver notificationObserver = new GRPCNotificationResponseObserver(this);
        StreamObserver<NotificationAck> streamObserver = asyncStub.streamPayload(notificationObserver);
        notificationObserver.startGRPCNotification(streamObserver);
        this.isStarted = true;
    }

}


/***
 * GRPCNotificationResponseObserver
 * This class is responsible to observe the stream of the bidirectional communication happening between client application and GRPC server
 * Implements StreamObserver class as the duplex communication will be in stream
 * ***/
class GRPCNotificationResponseObserver implements StreamObserver<NotificationPayload> {
    private StreamObserver<NotificationAck> notificationRequestObserver;
    private final GrpcInterFace notificationListener;

    public GRPCNotificationResponseObserver(GrpcInterFace notificationListener) {
        this.notificationListener = notificationListener;
    }

    /***
     * This method is responsible for initiating the connection to the server ( initially the acknowledgement will be sent for a random notification id )'''
     * ***/
    public void startGRPCNotification( StreamObserver<NotificationAck> notificationRequestObserver){
        this.notificationRequestObserver = notificationRequestObserver;
        Log.i("GRPC NOTIFICATION", "[Started]");
        this.notificationRequestObserver.onNext(NotificationAck.newBuilder().setId("").build());
    }

    @Override
    public void onNext(@NonNull NotificationPayload notification) {
        if (notification.getId() != null && !notification.getId().isEmpty()) {
            this.notificationRequestObserver.onNext(NotificationAck.newBuilder().setId(notification.getId()).build());
        } else {
            Log.w("GRPC", "Received invalid notification ID");
        }
        notificationListener.onMessage(notification);
    }

    @Override
    public void onError(@NonNull Throwable t) {
        Log.e("GRPC CONNECTION", "[Error] : " + t);
        notificationListener.onError(t);
    }

    @Override
    public void onCompleted() {
        Log.e("GRPC STREAM", "[onCompleted] ");
        notificationListener.onComplete();
    }
}

/***
 * GRPCNotificationHeaderInterceptor
 * This class is responsible for modifying the message ( here adding header in the message ) before sending the message to the server in duplex communication
 * ***/

class GRPCNotificationHeaderInterceptor implements ClientInterceptor {
    final private String token;
    GRPCNotificationHeaderInterceptor(String token) {
        this.token = token;
    }

    @Override
    public <ReqT, RespT> ClientCall<ReqT, RespT> interceptCall(MethodDescriptor<ReqT, RespT> method, CallOptions callOptions, Channel next) {
        return new ForwardingClientCall.SimpleForwardingClientCall<ReqT, RespT>(next.newCall(method, callOptions)) {

            @Override
            public void start(Listener<RespT> responseListener, Metadata headers) {
                headers.put(Metadata.Key.of("token", ASCII_STRING_MARSHALLER), token);
                super.start(responseListener, headers);
            }
        };
    }
}

//adb -s RZ8M91D2CEA reverse tcp:8080 tcp:50051
