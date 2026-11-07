package com.example.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface SessionDao {
    @Query("SELECT * FROM recording_sessions ORDER BY startTime DESC")
    fun getAllSessions(): Flow<List<SessionEntity>>

    @Query("SELECT * FROM recording_sessions WHERE id = :id LIMIT 1")
    suspend fun getSessionById(id: Long): SessionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: SessionEntity): Long

    @Update
    suspend fun updateSession(session: SessionEntity)

    @Query("DELETE FROM recording_sessions WHERE id = :id")
    suspend fun deleteSessionById(id: Long)

    @Query("DELETE FROM recording_sessions")
    suspend fun deleteAllSessions()

    @Query("SELECT COUNT(*) FROM recording_sessions")
    fun getSessionCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM recording_sessions WHERE isPositive = 1")
    fun getPositiveSessionCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM recording_sessions WHERE isPositive = 0")
    fun getNegativeSessionCount(): Flow<Int>
}

@Dao
interface SampleDao {
    @Query("SELECT * FROM imu_samples WHERE sessionId = :sessionId ORDER BY relTimeMs ASC")
    suspend fun getSamplesForSession(sessionId: Long): List<SampleEntity>

    @Query("SELECT * FROM imu_samples WHERE sessionId = :sessionId ORDER BY relTimeMs ASC")
    fun getSamplesForSessionFlow(sessionId: Long): Flow<List<SampleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSamples(samples: List<SampleEntity>)

    @Query("DELETE FROM imu_samples WHERE sessionId = :sessionId")
    suspend fun deleteSamplesForSession(sessionId: Long)

    @Query("DELETE FROM imu_samples")
    suspend fun deleteAllSamples()

    @Query("SELECT COUNT(*) FROM imu_samples")
    fun getTotalSampleCount(): Flow<Int>
}
