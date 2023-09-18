package com.eventsource

import androidx.annotation.WorkerThread
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import java.util.concurrent.TimeUnit
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.Arguments
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.net.SocketTimeoutException

enum class EventType(val value: String) {
  OPENED("open"),
  CLOSED("close"),
  EVENT("message"),
  ERROR("error"),
  TIMEOUT("timeout")
}

class EventSourceModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private lateinit var eventSource: EventSource
  private lateinit var httpClient: OkHttpClient
  private var connected = false
  private var debug = false

  override fun getName(): String {
    return NAME
  }

  /**
   * init event source instance
   *
   * TODO: add other body type. only handles stringify json data now.
   *
   * @param url endpoint
   * @param options { method: "GET" | "POST", headers: HashMap<String, String>, body: String, timeout: Int, debug: Boolean }
   *
   */
  @ReactMethod
  fun connect(url: String, options: ReadableMap) {
    if (this.connected) {
      throw RuntimeException("[react-native-event-source] only single connection can be made\nplease disconnect before create new connection")
    }

    this.connected = true;

    val request = Request.Builder()
      .url(url)
      .header("Content-Type", "application/json")
      .addHeader("Accept", "text/event-source")
      .addHeader("Accept", "application/json")

    this.debug = if (options.hasKey("debug")) options.getBoolean("debug") else false
    val timeout = if (options.hasKey("timeout")) options.getInt("timeout") else 30 * 1000
    val headers = if (options.hasKey("headers")) options.getMap("headers")?.toHashMap() else HashMap()
    val method = if (options.hasKey("method")) options.getString("method") ?: "GET" else "GET"
    val body = if (options.hasKey("body")) options.getMap("body")?. toHashMap() else HashMap()

    // init httpClient
    this.httpClient = OkHttpClient.Builder()
      .connectTimeout(timeout.toLong(), TimeUnit.MILLISECONDS)
      .readTimeout(timeout.toLong(), TimeUnit.MILLISECONDS)
      .writeTimeout(timeout.toLong(), TimeUnit.MILLISECONDS)
      .retryOnConnectionFailure(false)
      .build()

    // inject custom headers
    headers?.entries?.forEach{ (key, value) ->
        run {
          request.addHeader(key, value.toString())
        }
    }

    this.log("method $method timeout ${timeout.toLong()} headers $headers url $url")

    if (method == "POST") {
      val mediaType = "application/json; charset=utf-8".toMediaType()
      val requestBody = body?.let { JSONObject(it).toString().toRequestBody(mediaType) }
      request.method("POST", requestBody)
    } else if (method == "GET")  {
      request.get()
    } else {
      throw RuntimeException("[react-native-event-source] method should be GET or POST")
    }

    val listeners = object : EventSourceListener() {
      @WorkerThread
      override fun onOpen(eventSource: EventSource, response: Response) {
        super.onOpen(eventSource, response)
        this@EventSourceModule.log("opened $response")
        this@EventSourceModule.sendEvent(EventType.OPENED, null)
      }

      @WorkerThread
      override fun onEvent(eventSource: EventSource, id: String?, type: String?, data: String) {
        super.onEvent(eventSource, id, type, data)
        this@EventSourceModule.log("message $data")
        this@EventSourceModule.sendEvent(EventType.EVENT, data)
      }

      @WorkerThread
      override fun onFailure(eventSource: EventSource, t: Throwable?, response: Response?) {
        super.onFailure(eventSource, t, response)

        this@EventSourceModule.log("failed response $t ${response}")

        // http error
        if (response !== null && (response.code < 200 || response.code >= 400) ) {
          val params: WritableMap = Arguments.createMap().apply {
            putInt("statusCode", response.code)
            putString("message", response.message)
            putString("data", response.body?.string() ?: "{}")
          }

          this@EventSourceModule.sendError(params)
          // TODO: add retry logic
          this@EventSourceModule.disconnect()
        }

        // timeout error
        if (t is SocketTimeoutException) {
          this@EventSourceModule.sendEvent(EventType.TIMEOUT, null)
          // TODO: add retry logic
          this@EventSourceModule.disconnect()
        }
      }

      @WorkerThread
      override fun onClosed(eventSource: EventSource) {
        super.onClosed(eventSource)
        this@EventSourceModule.log("closed")
        this@EventSourceModule.sendEvent(EventType.CLOSED, null)
      }
    }

    this.eventSource = EventSources.createFactory(this.httpClient).newEventSource(request = request.build(), listener = listeners)

    this.eventSource.request()
  }

  @ReactMethod
  fun disconnect() {
    if (this.connected) {
      this.eventSource.cancel()
      this.httpClient.dispatcher.executorService.shutdown()
      this.connected = false;
      this.log("closed connection")
    }
  }

  private fun sendEvent(event: EventType, data: String?) {
    val params: WritableMap = Arguments.createMap().apply {
      putString("type", event.name)

      if (data !== null) {
        putString("data", data)
      }
    }

    this.reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event.value, params)
  }

  private fun sendError(params: WritableMap) {
    params.putString("type", EventType.ERROR.value);

    this.reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(EventType.ERROR.value, params);
  }

  private fun log(msg: String) {
    if (this.debug) {
      println("[react-native-event-source] $msg")
    }
  }

  companion object {
    const val NAME = "EventSource"
  }
}
