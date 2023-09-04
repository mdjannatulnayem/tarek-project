#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "TUTORA";      // Your WiFi SSID
const char* password = "azizkaka";  // Your WiFi password
const char* serverAddress = "http://192.168.0.106:3000/data/2";  // Replace with your server address and port

DynamicJsonDocument doc(256);
double amp = 1.23;
double volt = 220;

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Send a POST request
  sendPostRequest();
}

void loop() {
  // Send a POST request
  sendPostRequest();
  delay(10000);
}

void sendPostRequest() {
  HTTPClient http;
  WiFiClient client;

  // Your data to send in the POST request
  String postData;
  doc["amp"] = amp;
  doc["volt"] = volt;
  serializeJson(doc, postData);

  // Start HTTP POST request
  http.begin(client,serverAddress);
  http.addHeader("Content-Type", "application/json");

  // Send POST request and get the response
  int httpResponseCode = http.POST(postData);

  // Check for a successful request
  if (httpResponseCode == HTTP_CODE_CREATED) {
    String response = http.getString();
    Serial.println("POST Request was successful");
    Serial.println("Response: " + response);
  } else {
    Serial.println("Error in POST Request");
    Serial.println("HTTP Response Code: " + String(httpResponseCode));
  }

  // End HTTP connection
  http.end();
}
