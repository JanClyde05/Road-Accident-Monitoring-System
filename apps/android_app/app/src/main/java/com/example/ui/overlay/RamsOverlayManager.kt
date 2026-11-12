package com.example.ui.overlay

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ObjectAnimator
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.DisplayMetrics
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.TextView
import com.example.ai.VoiceAlarmCanceler

/**
 * RAMS Google Assistant Style Bottom System Overlay Manager.
 *
 * Implements a floating bottom-sheet popup (SYSTEM_ALERT_WINDOW) modeled after Google Assistant
 * and Gemini. Displays signature 4-color glowing lightbar, live voice transcription, cognitive responses,
 * quick action chips (Transit mode, Map, Telemetry), and immediate emergency crash abort controls
 * directly over any active third-party application (Google Maps, Waze, Facebook, YouTube, Homescreen).
 *
 * Zero-Emoji compliance and Ponytail Decision Ladder strictly enforced.
 */
object RamsOverlayManager {

    private const val TAG = "RamsOverlayManager"

    private var appContext: Context? = null
    private var windowManager: WindowManager? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    private var rootView: FrameLayout? = null
    private var cardLayout: LinearLayout? = null
    private var lightbarLayout: LinearLayout? = null
    private var statusDot: View? = null
    private var titleText: TextView? = null
    private var badgeText: TextView? = null
    private var promptText: TextView? = null
    private var bodyText: TextView? = null
    private var actionScroll: HorizontalScrollView? = null
    private var actionChipsLayout: LinearLayout? = null

    private var layoutParams: WindowManager.LayoutParams? = null
    private var isViewAttached = false

    @Volatile
    var isAppInForeground = false

    // Action listeners
    var onAlarmCancelledListener: (() -> Unit)? = null
    var onMicTappedListener: (() -> Unit)? = null
    var onOpenAppListener: (() -> Unit)? = null
    var onActionChipSelectedListener: ((action: String) -> Unit)? = null

    // Auto-dismiss runnable
    private val autoDismissRunnable = Runnable {
        hideOverlay()
    }

    /**
     * Initializes the overlay manager with application context.
     */
    fun init(context: Context) {
        val app = context.applicationContext
        appContext = app
        windowManager = app.getSystemService(Context.WINDOW_SERVICE) as? WindowManager
    }

    /**
     * Checks if Android has granted SYSTEM_ALERT_WINDOW permission.
     */
    fun canDrawOverlays(context: Context? = appContext): Boolean {
        val ctx = context ?: appContext ?: return false
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(ctx)
        } else {
            true
        }
    }

    /**
     * Opens Android System Settings to grant "Display over other apps" permission.
     */
    fun requestOverlayPermission(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                Log.i(TAG, "Navigated to package overlay permission management settings.")
            } catch (e: Exception) {
                try {
                    val fallbackIntent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(fallbackIntent)
                    Log.i(TAG, "Navigated to generic overlay permission management settings.")
                } catch (e2: Exception) {
                    Log.w(TAG, "Failed to launch overlay settings: ${e2.message}")
                }
            }
        }
    }

    /**
     * Surfaces or updates the Google Assistant-style bottom popup for voice assistant interactions.
     */
    fun showVoiceOverlay(
        prompt: String,
        transcript: String,
        state: VoiceAlarmCanceler.VoiceEngineState
    ) {
        if (!canDrawOverlays()) {
            Log.d(TAG, "Overlay permission not granted. Requesting via intent fallback.")
            appContext?.let { requestOverlayPermission(it) }
            return
        }

        mainHandler.post {
            ensureOverlayCreated()
            cancelAutoDismiss()

            val dotColor: Int
            val strokeColor: Int
            val badgeLabel: String
            val badgeBg: Int

            when (state) {
                VoiceAlarmCanceler.VoiceEngineState.AWAITING_COMMAND -> {
                    dotColor = Color.parseColor("#38BDF8") // Sky blue
                    strokeColor = Color.parseColor("#38BDF8")
                    badgeLabel = "LISTENING"
                    badgeBg = Color.parseColor("#0C4A6E")
                }
                VoiceAlarmCanceler.VoiceEngineState.HEARING_SPEECH -> {
                    dotColor = Color.parseColor("#F59E0B") // Amber
                    strokeColor = Color.parseColor("#F59E0B")
                    badgeLabel = "HEARING..."
                    badgeBg = Color.parseColor("#78350F")
                }
                VoiceAlarmCanceler.VoiceEngineState.CHATTING -> {
                    dotColor = Color.parseColor("#38BDF8") // Sky blue
                    strokeColor = Color.parseColor("#0284C7")
                    badgeLabel = "RESPONDING"
                    badgeBg = Color.parseColor("#0369A1")
                }
                VoiceAlarmCanceler.VoiceEngineState.COMMAND_SPOTTED -> {
                    dotColor = Color.parseColor("#10B981") // Emerald
                    strokeColor = Color.parseColor("#10B981")
                    badgeLabel = "EXECUTED"
                    badgeBg = Color.parseColor("#064E3B")
                }
                else -> {
                    dotColor = Color.parseColor("#38BDF8")
                    strokeColor = Color.parseColor("#38BDF8")
                    badgeLabel = "ACTIVE"
                    badgeBg = Color.parseColor("#1E293B")
                }
            }

            updateCardStyling(strokeColor = strokeColor)
            statusDot?.background = createRoundedDrawable(dotColor, radiusDp = 6)
            titleText?.text = "RAMS COGNITIVE ASSISTANT"
            titleText?.setTextColor(Color.WHITE)

            badgeText?.text = badgeLabel
            badgeText?.setTextColor(Color.WHITE)
            badgeText?.background = createRoundedDrawable(badgeBg, radiusDp = 4)

            promptText?.text = prompt
            promptText?.setTextColor(Color.parseColor("#94A3B8")) // Slate-400

            bodyText?.text = transcript.ifBlank { "Say your question, command, or transit mode..." }
            bodyText?.setTextColor(Color.WHITE)

            // Show standard Google Assistant quick action chips
            setupVoiceActionChips()

            if (!isViewAttached) {
                attachOverlayToWindow()
            }
        }
    }

    /**
     * Surfaces the urgent red alert floating overlay during an active crash alarm.
     */
    fun showAlarmOverlay(countdownSeconds: Int) {
        if (!canDrawOverlays()) return

        mainHandler.post {
            ensureOverlayCreated()
            cancelAutoDismiss()

            val red = Color.parseColor("#EF4444")
            val darkRedBg = Color.parseColor("#7F1D1D")

            updateCardStyling(strokeColor = red)
            statusDot?.background = createRoundedDrawable(red, radiusDp = 6)
            titleText?.text = "EMERGENCY CRASH ALERT"
            titleText?.setTextColor(red)

            badgeText?.text = "COUNTDOWN ${countdownSeconds}s"
            badgeText?.setTextColor(Color.WHITE)
            badgeText?.background = createRoundedDrawable(darkRedBg, radiusDp = 4)

            promptText?.text = "Severe kinematic impact shock! Dispatching SMS in ${countdownSeconds}s"
            promptText?.setTextColor(Color.parseColor("#FCA5A5"))

            bodyText?.text = "Say 'Cancel', 'Stop', or tap button below to abort false alarm."
            bodyText?.setTextColor(Color.WHITE)

            setupAlarmActionButtons()

            if (!isViewAttached) {
                attachOverlayToWindow()
            }
        }
    }

    /**
     * Updates the countdown seconds display in alarm mode.
     */
    fun updateAlarmCountdown(countdownSeconds: Int) {
        if (!isViewAttached) return
        mainHandler.post {
            badgeText?.text = "COUNTDOWN ${countdownSeconds}s"
            promptText?.text = "Severe kinematic impact shock! Dispatching SMS in ${countdownSeconds}s"
        }
    }

    /**
     * Updates live speech transcript text in real time.
     */
    fun updateTranscript(text: String) {
        if (!isViewAttached) return
        mainHandler.post {
            bodyText?.text = text
            badgeText?.text = "HEARING..."
            badgeText?.background = createRoundedDrawable(Color.parseColor("#78350F"), radiusDp = 4)
        }
    }

    /**
     * Updates AI cognitive response and schedules auto-dismiss after reading delay.
     */
    fun updateResponse(reply: String, autoDismissDelayMs: Long = 7000L) {
        if (!isViewAttached) return
        mainHandler.post {
            promptText?.text = "RAMS Response"
            bodyText?.text = reply
            badgeText?.text = "ANSWERED"
            badgeText?.background = createRoundedDrawable(Color.parseColor("#047857"), radiusDp = 4)
            scheduleAutoDismiss(autoDismissDelayMs)
        }
    }

    /**
     * Schedules auto-dismissal of the overlay.
     */
    fun scheduleAutoDismiss(delayMs: Long = 6000L) {
        cancelAutoDismiss()
        mainHandler.postDelayed(autoDismissRunnable, delayMs)
    }

    /**
     * Cancels any pending auto-dismissal.
     */
    fun cancelAutoDismiss() {
        mainHandler.removeCallbacks(autoDismissRunnable)
    }

    /**
     * Smoothly slides down and removes the overlay from the WindowManager.
     */
    fun hideOverlay() {
        mainHandler.post {
            cancelAutoDismiss()
            val card = cardLayout ?: return@post
            val view = rootView ?: return@post
            if (!isViewAttached) return@post

            try {
                val slideDown = ObjectAnimator.ofFloat(card, "translationY", 0f, dpToPx(300, card.context).toFloat())
                val fadeOut = ObjectAnimator.ofFloat(view, "alpha", 1f, 0f)
                slideDown.duration = 220
                fadeOut.duration = 220
                slideDown.interpolator = DecelerateInterpolator()
                slideDown.addListener(object : AnimatorListenerAdapter() {
                    override fun onAnimationEnd(animation: Animator) {
                        detachViewSafely()
                    }
                })
                slideDown.start()
                fadeOut.start()
            } catch (e: Exception) {
                detachViewSafely()
            }
        }
    }

    private fun detachViewSafely() {
        try {
            if (isViewAttached && rootView != null && windowManager != null) {
                windowManager?.removeView(rootView)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error removing overlay view: ${e.message}")
        } finally {
            isViewAttached = false
        }
    }

    /**
     * Releases all resources when service or application shuts down.
     */
    fun dismiss() {
        hideOverlay()
        rootView = null
        cardLayout = null
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun ensureOverlayCreated() {
        val ctx = appContext ?: return
        if (rootView != null) return

        val wm = windowManager ?: return

        // 1. Root FrameLayout (Google Assistant outside tap dismissal)
        val root = FrameLayout(ctx).apply {
            alpha = 1f
            setOnTouchListener { _, event ->
                if (event.action == MotionEvent.ACTION_OUTSIDE) {
                    hideOverlay()
                    true
                } else {
                    false
                }
            }
        }

        // 2. Main Bottom Card Layout (Google Assistant style floating bottom sheet)
        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            val pad = dpToPx(14, ctx)
            setPadding(pad, pad, pad, pad)
        }

        // 3. Signature Google Assistant 4-color glowing lightbar
        val lightbar = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(3, ctx)
            ).apply {
                bottomMargin = dpToPx(10, ctx)
            }
            layoutParams = lp
        }

        // 4 colors: Sky Blue, Coral Red, Amber Yellow, Emerald Green
        val colors = listOf("#38BDF8", "#EF4444", "#F59E0B", "#10B981")
        for (hex in colors) {
            val segment = View(ctx).apply {
                setBackgroundColor(Color.parseColor(hex))
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply {
                    marginEnd = dpToPx(2, ctx)
                }
            }
            lightbar.addView(segment)
        }
        lightbarLayout = lightbar
        card.addView(lightbar)

        // 4. Header Row (Status dot + Title + Badge + Close X)
        val header = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }

        val dot = View(ctx).apply {
            val size = dpToPx(10, ctx)
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                marginEnd = dpToPx(8, ctx)
            }
        }
        statusDot = dot
        header.addView(dot)

        val title = TextView(ctx).apply {
            typeface = Typeface.MONOSPACE
            setTypeface(typeface, Typeface.BOLD)
            textSize = 12f
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        titleText = title
        header.addView(title)

        val badge = TextView(ctx).apply {
            typeface = Typeface.MONOSPACE
            setTypeface(typeface, Typeface.BOLD)
            textSize = 10f
            val hPad = dpToPx(6, ctx)
            val vPad = dpToPx(2, ctx)
            setPadding(hPad, vPad, hPad, vPad)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                marginEnd = dpToPx(10, ctx)
            }
        }
        badgeText = badge
        header.addView(badge)

        val closeBtn = TextView(ctx).apply {
            text = "X"
            typeface = Typeface.MONOSPACE
            setTypeface(typeface, Typeface.BOLD)
            textSize = 14f
            setTextColor(Color.parseColor("#94A3B8"))
            val pad = dpToPx(6, ctx)
            setPadding(pad, pad, pad, pad)
            setOnClickListener { hideOverlay() }
        }
        header.addView(closeBtn)

        card.addView(header)

        // 5. Subtle divider
        val divider = View(ctx).apply {
            setBackgroundColor(Color.parseColor("#27272A"))
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(1, ctx)
            ).apply {
                topMargin = dpToPx(6, ctx)
                bottomMargin = dpToPx(6, ctx)
            }
            layoutParams = lp
        }
        card.addView(divider)

        // 6. Prompt Label
        val prompt = TextView(ctx).apply {
            textSize = 11f
            setTextColor(Color.parseColor("#94A3B8"))
            typeface = Typeface.DEFAULT
        }
        promptText = prompt
        card.addView(prompt)

        // 7. Body / Transcript / Response Text
        val body = TextView(ctx).apply {
            textSize = 13.5f
            setTypeface(Typeface.DEFAULT, Typeface.BOLD)
            setTextColor(Color.WHITE)
            maxLines = 6
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dpToPx(4, ctx)
            }
            layoutParams = lp
        }
        bodyText = body
        card.addView(body)

        // 8. Horizontal Scrollable Action Chips Container (Google Assistant style)
        val scroll = HorizontalScrollView(ctx).apply {
            isHorizontalScrollBarEnabled = false
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dpToPx(10, ctx)
            }
            layoutParams = lp
        }
        actionScroll = scroll

        val chipsLayout = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        actionChipsLayout = chipsLayout
        scroll.addView(chipsLayout)
        card.addView(scroll)

        // Measure screen width for responsive bottom floating card
        val metrics = ctx.resources.displayMetrics
        val cardWidth = (metrics.widthPixels * 0.94f).toInt().coerceIn(dpToPx(320, ctx), dpToPx(440, ctx))

        val cardLp = FrameLayout.LayoutParams(
            cardWidth,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            bottomMargin = dpToPx(16, ctx) // Bottom padding above navigation bar
        }
        root.addView(card, cardLp)

        cardLayout = card
        rootView = root

        // Configure WindowManager LayoutParams for Google Assistant style bottom popup
        val windowType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val lp = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            windowType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
            WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH or
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            x = 0
            y = dpToPx(16, ctx)
        }
        layoutParams = lp

        // Swipe-down-to-dismiss gesture
        setupSwipeDownDismiss(card)
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupSwipeDownDismiss(card: View) {
        var initialY = 0f
        var isDraggingDown = false

        card.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialY = event.rawY
                    isDraggingDown = false
                    cancelAutoDismiss()
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dy = event.rawY - initialY
                    if (dy > 20) {
                        isDraggingDown = true
                        card.translationY = dy
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    val dy = event.rawY - initialY
                    if (isDraggingDown && dy > 120) {
                        hideOverlay()
                    } else {
                        // Snap back smoothly
                        ObjectAnimator.ofFloat(card, "translationY", card.translationY, 0f).apply {
                            duration = 180
                            interpolator = OvershootInterpolator(0.8f)
                            start()
                        }
                        scheduleAutoDismiss(6000L)
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun setupVoiceActionChips() {
        val ctx = appContext ?: return
        val chips = actionChipsLayout ?: return
        chips.removeAllViews()

        // Chip helper
        fun addChip(label: String, actionKey: String, isPrimary: Boolean = false) {
            val chip = TextView(ctx).apply {
                text = label
                typeface = Typeface.MONOSPACE
                setTypeface(typeface, Typeface.BOLD)
                textSize = 10f
                setTextColor(if (isPrimary) Color.WHITE else Color.parseColor("#38BDF8"))
                background = if (isPrimary) {
                    createRoundedDrawable(Color.parseColor("#0284C7"), radiusDp = 14)
                } else {
                    createStrokeDrawable(
                        bgColor = Color.parseColor("#18181B"),
                        strokeColor = Color.parseColor("#38BDF8"),
                        radiusDp = 14,
                        ctx = ctx
                    )
                }
                val hPad = dpToPx(10, ctx)
                val vPad = dpToPx(5, ctx)
                setPadding(hPad, vPad, hPad, vPad)
                setOnClickListener {
                    cancelAutoDismiss()
                    when (actionKey) {
                        "ACTION_LISTEN" -> onMicTappedListener?.invoke()
                        "ACTION_OPEN_RAMS" -> {
                            hideOverlay()
                            onOpenAppListener?.invoke()
                        }
                        else -> {
                            onActionChipSelectedListener?.invoke(actionKey)
                            scheduleAutoDismiss(4000L)
                        }
                    }
                }
                val lp = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    marginEnd = dpToPx(6, ctx)
                }
                layoutParams = lp
            }
            chips.addView(chip)
        }

        addChip("LISTEN", "ACTION_LISTEN", isPrimary = true)
        addChip("WALK MODE", "SET_CATEGORY_PEDESTRIAN")
        addChip("MOTOR MODE", "SET_CATEGORY_MOTORCYCLE")
        addChip("SHOW MAP", "NAV_MAP")
        addChip("TELEMETRY", "NAV_TELEMETRY")
        addChip("OPEN RAMS", "ACTION_OPEN_RAMS")
    }

    private fun setupAlarmActionButtons() {
        val ctx = appContext ?: return
        val chips = actionChipsLayout ?: return
        chips.removeAllViews()

        // 1. CANCEL ALARM Button (Red)
        val btnCancel = TextView(ctx).apply {
            text = "CANCEL ALARM"
            typeface = Typeface.MONOSPACE
            setTypeface(typeface, Typeface.BOLD)
            textSize = 11f
            setTextColor(Color.WHITE)
            background = createRoundedDrawable(Color.parseColor("#DC2626"), radiusDp = 8)
            val hPad = dpToPx(14, ctx)
            val vPad = dpToPx(7, ctx)
            setPadding(hPad, vPad, hPad, vPad)
            setOnClickListener {
                hideOverlay()
                onAlarmCancelledListener?.invoke()
            }
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                marginEnd = dpToPx(10, ctx)
            }
            layoutParams = lp
        }
        chips.addView(btnCancel)

        // 2. I AM SAFE Button (Green)
        val btnSafe = TextView(ctx).apply {
            text = "I AM SAFE"
            typeface = Typeface.MONOSPACE
            setTypeface(typeface, Typeface.BOLD)
            textSize = 11f
            setTextColor(Color.WHITE)
            background = createRoundedDrawable(Color.parseColor("#059669"), radiusDp = 8)
            val hPad = dpToPx(14, ctx)
            val vPad = dpToPx(7, ctx)
            setPadding(hPad, vPad, hPad, vPad)
            setOnClickListener {
                hideOverlay()
                onAlarmCancelledListener?.invoke()
            }
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            layoutParams = lp
        }
        chips.addView(btnSafe)
    }

    private fun updateCardStyling(strokeColor: Int) {
        val ctx = appContext ?: return
        val card = cardLayout ?: return
        val bg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            setColor(Color.parseColor("#121215")) // Charcoal dark
            cornerRadius = dpToPx(20, ctx).toFloat()
            setStroke(dpToPx(1.5f, ctx), strokeColor)
        }
        card.background = bg
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            card.elevation = dpToPx(16, ctx).toFloat()
        }
    }

    private fun attachOverlayToWindow() {
        val wm = windowManager ?: return
        val root = rootView ?: return
        val card = cardLayout ?: return
        val lp = layoutParams ?: return

        try {
            root.alpha = 0f
            card.translationY = dpToPx(250, root.context).toFloat()
            wm.addView(root, lp)
            isViewAttached = true

            // Smooth Google Assistant bottom slide-up and fade-in
            val slideUp = ObjectAnimator.ofFloat(card, "translationY", card.translationY, 0f)
            val fadeIn = ObjectAnimator.ofFloat(root, "alpha", 0f, 1f)
            slideUp.duration = 260
            fadeIn.duration = 200
            slideUp.interpolator = OvershootInterpolator(0.9f)
            slideUp.start()
            fadeIn.start()
            Log.i(TAG, "Attached Google Assistant style bottom overlay to WindowManager.")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to attach overlay window: ${e.message}")
            isViewAttached = false
        }
    }

    private fun createRoundedDrawable(color: Int, radiusDp: Int): GradientDrawable {
        val ctx = appContext
        val radiusPx = if (ctx != null) dpToPx(radiusDp, ctx).toFloat() else radiusDp * 2.5f
        return GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            setColor(color)
            cornerRadius = radiusPx
        }
    }

    private fun createStrokeDrawable(
        bgColor: Int,
        strokeColor: Int,
        radiusDp: Int,
        ctx: Context
    ): GradientDrawable {
        return GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            setColor(bgColor)
            cornerRadius = dpToPx(radiusDp, ctx).toFloat()
            setStroke(dpToPx(1, ctx), strokeColor)
        }
    }

    private fun dpToPx(dp: Int, context: Context): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            context.resources.displayMetrics
        ).toInt()
    }

    private fun dpToPx(dp: Float, context: Context): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp,
            context.resources.displayMetrics
        ).toInt()
    }
}
