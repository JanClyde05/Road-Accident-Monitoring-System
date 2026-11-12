package com.example.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.MainActivity
import com.example.ui.overlay.RamsOverlayManager

/**
 * RAMS Always-On Rider Protection Foreground Service.
 *
 * Keeps real-time crash monitoring, 50Hz sensor analysis, and Bluetooth BLE
 * synchronization active in the background when the phone screen is turned off
 * or another application is active.
 *
 * Adheres strictly to Zero-Emoji guidelines and robust battery management.
 */
class RamsForegroundService : Service() {

    companion object {
        private const val TAG = "RamsForegroundService"
        const val CHANNEL_ID = "rams_safety_monitoring_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_START = "ACTION_START_PROTECTION"
        const val ACTION_STOP = "ACTION_STOP_PROTECTION"

        @Volatile
        var isServiceRunning = false
            private set

        @Volatile
        var activeVoiceCanceler: com.example.ai.VoiceAlarmCanceler? = null

        fun start(context: Context) {
            val intent = Intent(context, RamsForegroundService::class.java).apply {
                action = ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, RamsForegroundService::class.java).apply {
                action = ACTION_STOP
            }
            context.stopService(intent)
        }

        /**
         * Posts a high-priority heads-up notification when voice assistant is activated
         * while overlay permission (SYSTEM_ALERT_WINDOW) is not yet granted.
         */
        fun postHeadsUpNotification(context: Context, title: String, content: String) {
            try {
                val openIntent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("OPEN_VOICE_BUBBLE", true)
                }
                val pendingOpen = PendingIntent.getActivity(
                    context,
                    101,
                    openIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                val overlayIntent = Intent(android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                val pendingOverlay = PendingIntent.getActivity(
                    context,
                    102,
                    overlayIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                val notif = NotificationCompat.Builder(context, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText(content)
                    .setSmallIcon(android.R.drawable.ic_lock_idle_charging)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setContentIntent(pendingOpen)
                    .setAutoCancel(true)
                    .addAction(android.R.drawable.ic_menu_help, "ALLOW POPUP", pendingOverlay)
                    .build()

                val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                manager?.notify(2002, notif)
            } catch (e: Exception) {
                Log.w(TAG, "Failed to post assistant heads up: ${e.message}")
            }
        }
    }

    private var wakeLock: PowerManager.WakeLock? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            isServiceRunning = false
            return START_NOT_STICKY
        }

        val notification = buildForegroundNotification(
            title = "RAMS RIDER PROTECTION ACTIVE",
            content = "Crash detection & safety wearable link armed in background"
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            var serviceType = android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE or
                              android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                serviceType = serviceType or android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            }
            startForeground(NOTIFICATION_ID, notification, serviceType)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
        isServiceRunning = true

        return START_STICKY
    }

    private fun acquireWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
            wakeLock = powerManager?.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "RAMS:RiderProtectionWakeLock"
            )?.apply {
                setReferenceCounted(false)
                acquire(24 * 60 * 60 * 1000L) // 24-hour safe ride horizon
            }
        } catch (_: Exception) {}
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "RAMS Safety Protection Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Maintains 24/7 background accident monitoring and wearable connection."
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(title: String, content: String): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_lock_idle_charging)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceRunning = false
        try {
            RamsOverlayManager.dismiss()
        } catch (_: Exception) {}
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (_: Exception) {}
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
