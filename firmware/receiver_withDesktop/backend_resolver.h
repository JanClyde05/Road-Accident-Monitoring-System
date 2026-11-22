#pragma once
#include <Arduino.h>

void     backendInit();
bool     backendResolve();
String   backendBaseUrl();          // "http://host:port", empty if unresolved
String   backendHost();
uint16_t backendPort();
bool     backendUsingFallback();
void     backendSetManual(const String& hostPort);
void     backendNoteUpload(bool ok);
void     backendTick();             // call from loop()
