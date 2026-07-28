/*
  SIH 2026 - Village Water Point Monitoring
  ESP32 + Potentiometer Simulation
*/

const int sensorPin = 34;

String waterPointID = "WP001";
String habitation = "Thiruvallur";

void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(35)); // Initialize random generator
}

void loop() {

  // Read sensor
  int flowValue = analogRead(sensorPin);

  // Determine flow status
  String status;
  bool flowOK;

  if (flowValue < 200) {
    status = "NOT_WORKING";
    flowOK = false;
  }
  else if (flowValue < 1000) {
    status = "LOW_FLOW";
    flowOK = true;
  }
  else {
    status = "WORKING";
    flowOK = true;
  }

  // Simulate usage count
  int usageCount;

  if (flowValue < 200)
    usageCount = 0;
  else
    usageCount = random(5, 40);

  // Detect possible fault
  bool fault = false;

  if (flowValue < 200 && usageCount == 0)
    fault = true;

  // Print report
  Serial.println("======================================");
  Serial.println("Village Water Point Monitoring");
  Serial.println("======================================");

  Serial.print("Water Point ID : ");
  Serial.println(waterPointID);

  Serial.print("Habitation     : ");
  Serial.println(habitation);

  Serial.print("Flow Value     : ");
  Serial.println(flowValue);

  Serial.print("Flow Status    : ");
  Serial.println(status);

  Serial.print("Flow OK        : ");
  Serial.println(flowOK ? "YES" : "NO");

  Serial.print("Usage Count    : ");
  Serial.println(usageCount);

  Serial.print("Recorded At(ms): ");
  Serial.println(millis());

  if (fault) {
    Serial.println("ALERT : Pump may be faulty!");
    Serial.println("Priority : HIGH");
  } else {
    Serial.println("Priority : NORMAL");
  }

  Serial.println();

  delay(2000);
}