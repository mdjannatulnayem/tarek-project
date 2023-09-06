#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>
#define MAIN D3
#define LIGHT D2
#define FAN D1
#define DHTPIN D5     // what pin we're connected to
#define DHTTYPE DHT22   // DHT 22

const char* ssid = ""; // Replace with your WiFi SSID
const char* password = ""; // Replace with your WiFi password
const char* server = "http://192.168.XX.YY:ZZZZ";

DHT dht(DHTPIN, DHTTYPE); //// Initialize DHT sensor for normal 16mhz Arduino

float t; //Stores temperature value

DynamicJsonDocument doc(128);

void setup()
{
  dht.begin();
  Serial.begin(115200);
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  pinMode(DHTPIN,INPUT);
  pinMode(MAIN, OUTPUT);
  pinMode(LIGHT, OUTPUT);
  pinMode(FAN, OUTPUT);
}

void loop()
{
  t = dht.readTemperature();
  updateTemperature(server, "/addtemp/", t);
  makeRequest(server, "/switches/main", MAIN);
  makeRequest(server, "/switches/light", LIGHT);
  makeRequest(server, "/switches/fan", FAN);
  // Wait for a while before making another request (adjust the delay as needed)
  delay(5000);
}

void updateTemperature(String url, String path, double t) {
  // Create an HTTPClient object
  HTTPClient http;
  WiFiClient client;

  // Set the server address and port
  http.begin(client, url + path + String(t));

  // Send the GET request and wait for the response
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();

    // Parse JSON response
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {

      // Perform your desired actions based on the switchValue here

    } else {
      Serial.println("Failed to parse JSON!");
    }
  } else {
    Serial.print("HTTP error code: ");
    Serial.println(httpCode);
  }

  // End the HTTPClient
  http.end();
}

void makeRequest(String url, String path, int sw)
{
  // Create an HTTPClient object
  HTTPClient http;
  WiFiClient client;

  // Set the server address and port
  http.begin(client, url + path);

  // Send the GET request and wait for the response
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();

    // Parse JSON response
    DeserializationError error = deserializeJson(doc, response);

    if (!error && doc.containsKey("switchValue")) {

      bool switchValue = doc["switchValue"];
      Serial.print("Switch Value: ");
      Serial.println(switchValue);
      if (!bool(switchValue)) digitalWrite(sw, HIGH);
      else digitalWrite(sw, LOW);

      // Perform your desired actions based on the switchValue here

    } else {
      Serial.println("Failed to parse JSON or switchValue not found.");
    }
  } else {
    Serial.print("HTTP error code: ");
    Serial.println(httpCode);
  }

  // End the HTTPClient
  http.end();
}
