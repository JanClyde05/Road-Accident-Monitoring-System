package com.example

import android.app.Application
import com.example.sync.Esp32SyncEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

class RamsApplication : Application() {
  val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
  val esp32SyncEngine by lazy { Esp32SyncEngine(applicationScope, this) }

  override fun onCreate() {
    super.onCreate()
  }
}
