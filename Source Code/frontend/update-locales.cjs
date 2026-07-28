const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const files = ['en.json', 'hi.json', 'ta.json', 'te.json', 'ml.json', 'kn.json'];

const additions = {
  en: {
    pages: {
      data_title: "Water Readings",
      alerts_title: "System Alerts",
      maintenance_title: "Maintenance Hub",
      reports_title: "System Reports",
      monitor_title: "ESP32 Live Monitor"
    },
    ui: {
      search_placeholder: "Search by ID, Water Point, Village...",
      all_statuses: "All Statuses",
      total_records: "Total Records",
      critical_faults: "Critical Faults",
      no_records: "No maintenance records found.",
      schedule_repair: "Schedule Repair",
      select_report: "Select Report Type",
      daily_report: "Daily Report",
      export_pdf: "Export as PDF",
      export_csv: "Export as CSV",
      headers: {
        reading_id: "READING ID",
        water_point: "WATER POINT",
        village: "VILLAGE",
        flow_value: "FLOW VALUE",
        usage: "USAGE",
        status: "STATUS",
        recorded_time: "RECORDED TIME",
        time: "TIME",
        priority: "PRIORITY",
        technician: "TECHNICIAN",
        cost: "COST",
        completed_at: "COMPLETED AT",
        node_id: "NODE ID",
        flow: "FLOW",
        json_payload: "JSON PAYLOAD"
      }
    },
    data: { critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", normal: "NORMAL" },
    villages: { "Gerugambakkam": "Gerugambakkam", "Kolapakkam": "Kolapakkam", "Kovur": "Kovur", "Manimangalam": "Manimangalam", "Pannur": "Pannur", "Irungattukottai": "Irungattukottai", "Malaipattu": "Malaipattu", "Ezhichur": "Ezhichur", "Karasangal": "Karasangal", "Ariyaperumbakkam": "Ariyaperumbakkam", "Minjur": "Minjur", "Sholavaram": "Sholavaram", "Pakkam": "Pakkam", "Poondi": "Poondi", "Aranvoyal": "Aranvoyal", "Ikkadu": "Ikkadu", "Mappedu": "Mappedu", "Putlur": "Putlur", "Sevvapet": "Sevvapet", "Thamaaraipakkam": "Thamaaraipakkam", "Gowriwakkam": "Gowriwakkam", "Agaramthen": "Agaramthen", "Polivakkam": "Polivakkam", "Keelakattalai": "Keelakattalai", "Vandalur": "Vandalur", "Mudichur": "Mudichur", "Ottiyambakkam": "Ottiyambakkam", "Moolacheri": "Moolacheri", "Pudur": "Pudur", "Kumizhi": "Kumizhi" },
    faults: {
      "Impossible reading (out of bounds)": "Impossible reading (out of bounds)",
      "Sensor stuck at same value": "Sensor stuck at same value",
      "Sudden spike/drop in flow detected": "Sudden spike/drop in flow detected",
      "Zero flow detected": "Zero flow detected",
      "Extremely low flow": "Extremely low flow",
      "Flow below operational threshold": "Flow below operational threshold"
    }
  },
  hi: {
    pages: {
      data_title: "जल रीडिंग",
      alerts_title: "सिस्टम अलर्ट",
      maintenance_title: "रखरखाव हब",
      reports_title: "सिस्टम रिपोर्ट",
      monitor_title: "ESP32 लाइव मॉनिटर"
    },
    ui: {
      search_placeholder: "आईडी, जल बिंदु, गांव से खोजें...",
      all_statuses: "सभी स्थितियां",
      total_records: "कुल रिकॉर्ड",
      critical_faults: "गंभीर दोष",
      no_records: "कोई रखरखाव रिकॉर्ड नहीं मिला।",
      schedule_repair: "मरम्मत अनुसूची",
      select_report: "रिपोर्ट प्रकार चुनें",
      daily_report: "दैनिक रिपोर्ट",
      export_pdf: "PDF के रूप में निर्यात करें",
      export_csv: "CSV के रूप में निर्यात करें",
      headers: {
        reading_id: "रीडिंग आईडी",
        water_point: "जल बिंदु",
        village: "गांव",
        flow_value: "प्रवाह मूल्य",
        usage: "उपयोग",
        status: "स्थिति",
        recorded_time: "रिकॉर्ड किया गया समय",
        time: "समय",
        priority: "प्राथमिकता",
        technician: "तकनीशियन",
        cost: "लागत",
        completed_at: "पूरा होने का समय",
        node_id: "नोड आईडी",
        flow: "प्रवाह",
        json_payload: "JSON पेलोड"
      }
    },
    data: { critical: "गंभीर", high: "उच्च", medium: "मध्यम", normal: "सामान्य" },
    villages: { "Gerugambakkam": "Gerugambakkam", "Kolapakkam": "Kolapakkam", "Kovur": "Kovur", "Manimangalam": "Manimangalam", "Pannur": "Pannur", "Irungattukottai": "Irungattukottai", "Malaipattu": "Malaipattu", "Ezhichur": "Ezhichur", "Karasangal": "Karasangal", "Ariyaperumbakkam": "Ariyaperumbakkam", "Minjur": "Minjur", "Sholavaram": "Sholavaram", "Pakkam": "Pakkam", "Poondi": "Poondi", "Aranvoyal": "Aranvoyal", "Ikkadu": "Ikkadu", "Mappedu": "Mappedu", "Putlur": "Putlur", "Sevvapet": "Sevvapet", "Thamaaraipakkam": "Thamaaraipakkam", "Gowriwakkam": "Gowriwakkam", "Agaramthen": "Agaramthen", "Polivakkam": "Polivakkam", "Keelakattalai": "Keelakattalai", "Vandalur": "Vandalur", "Mudichur": "Mudichur", "Ottiyambakkam": "Ottiyambakkam", "Moolacheri": "Moolacheri", "Pudur": "Pudur", "Kumizhi": "Kumizhi" },
    faults: {
      "Impossible reading (out of bounds)": "असंभव रीडिंग (सीमा से बाहर)",
      "Sensor stuck at same value": "सेंसर एक ही मान पर अटका",
      "Sudden spike/drop in flow detected": "प्रवाह में अचानक वृद्धि/गिरावट",
      "Zero flow detected": "शून्य प्रवाह",
      "Extremely low flow": "अत्यंत कम प्रवाह",
      "Flow below operational threshold": "थ्रेसहोल्ड से नीचे प्रवाह"
    }
  },
  ta: {
    pages: {
      data_title: "நீர் வாசிப்புகள்",
      alerts_title: "கணினி எச்சரிக்கைகள்",
      maintenance_title: "பராமரிப்பு மையம்",
      reports_title: "கணினி அறிக்கைகள்",
      monitor_title: "நேரடி கண்காணிப்பு"
    },
    ui: {
      search_placeholder: "ஐடி, கிராமம் மூலம் தேடுக...",
      all_statuses: "அனைத்து நிலைகளும்",
      total_records: "மொத்த பதிவுகள்",
      critical_faults: "கடுமையான தவறுகள்",
      no_records: "பராமரிப்பு பதிவுகள் எதுவும் கிடைக்கவில்லை.",
      schedule_repair: "பழுதுபார்ப்பை திட்டமிடு",
      select_report: "அறிக்கை வகையைத் தேர்ந்தெடுக்கவும்",
      daily_report: "தினசரி அறிக்கை",
      export_pdf: "PDF ஆக ஏற்றுமதி செய்",
      export_csv: "CSV ஆக ஏற்றுமதி செய்",
      headers: {
        reading_id: "வாசிப்பு ஐடி",
        water_point: "தண்ணீர் புள்ளி",
        village: "கிராமம்",
        flow_value: "ஓட்ட மதிப்பு",
        usage: "பயன்பாடு",
        status: "நிலை",
        recorded_time: "பதிவு செய்யப்பட்ட நேரம்",
        time: "நேரம்",
        priority: "முன்னுரிமை",
        technician: "தொழில்நுட்ப வல்லுநர்",
        cost: "செலவு",
        completed_at: "முடிக்கப்பட்ட நேரம்",
        node_id: "நோட் ஐடி",
        flow: "ஓட்டம்",
        json_payload: "JSON தரவு"
      }
    },
    data: { critical: "மிக முக்கியமானது", high: "உயர்", medium: "நடுத்தர", normal: "சாதாரண" },
    villages: { "Gerugambakkam": "Gerugambakkam", "Kolapakkam": "Kolapakkam", "Kovur": "Kovur", "Manimangalam": "Manimangalam", "Pannur": "Pannur", "Irungattukottai": "Irungattukottai", "Malaipattu": "Malaipattu", "Ezhichur": "Ezhichur", "Karasangal": "Karasangal", "Ariyaperumbakkam": "Ariyaperumbakkam", "Minjur": "Minjur", "Sholavaram": "Sholavaram", "Pakkam": "Pakkam", "Poondi": "Poondi", "Aranvoyal": "Aranvoyal", "Ikkadu": "Ikkadu", "Mappedu": "Mappedu", "Putlur": "Putlur", "Sevvapet": "Sevvapet", "Thamaaraipakkam": "Thamaaraipakkam", "Gowriwakkam": "Gowriwakkam", "Agaramthen": "Agaramthen", "Polivakkam": "Polivakkam", "Keelakattalai": "Keelakattalai", "Vandalur": "Vandalur", "Mudichur": "Mudichur", "Ottiyambakkam": "Ottiyambakkam", "Moolacheri": "Moolacheri", "Pudur": "Pudur", "Kumizhi": "Kumizhi" },
    faults: {
      "Impossible reading (out of bounds)": "சாத்தியமற்ற வாசிப்பு (எல்லைக்கு வெளியே)",
      "Sensor stuck at same value": "சென்சார் ஒரே மதிப்பில் சிக்கியுள்ளது",
      "Sudden spike/drop in flow detected": "ஓட்டத்தில் திடீர் உயர்வு/வீழ்ச்சி",
      "Zero flow detected": "பூஜ்ஜிய ஓட்டம்",
      "Extremely low flow": "மிகக் குறைந்த ஓட்டம்",
      "Flow below operational threshold": "செயல்பாட்டு வரம்பிற்கு கீழே ஓட்டம்"
    }
  },
  te: {
    pages: {
      data_title: "Water Readings",
      alerts_title: "System Alerts",
      maintenance_title: "Maintenance Hub",
      reports_title: "System Reports",
      monitor_title: "ESP32 Live Monitor"
    },
    ui: {
      search_placeholder: "Search by ID, Water Point, Village...",
      all_statuses: "All Statuses",
      total_records: "Total Records",
      critical_faults: "Critical Faults",
      no_records: "No maintenance records found.",
      schedule_repair: "Schedule Repair",
      select_report: "Select Report Type",
      daily_report: "Daily Report",
      export_pdf: "Export as PDF",
      export_csv: "Export as CSV",
      headers: {
        reading_id: "READING ID",
        water_point: "WATER POINT",
        village: "VILLAGE",
        flow_value: "FLOW VALUE",
        usage: "USAGE",
        status: "STATUS",
        recorded_time: "RECORDED TIME",
        time: "TIME",
        priority: "PRIORITY",
        technician: "TECHNICIAN",
        cost: "COST",
        completed_at: "COMPLETED AT",
        node_id: "NODE ID",
        flow: "FLOW",
        json_payload: "JSON PAYLOAD"
      }
    },
    data: { critical: "క్లిష్టమైనది", high: "అధిక", medium: "మధ్యస్థ", normal: "సాధారణ" },
    villages: { "Gerugambakkam": "Gerugambakkam", "Kolapakkam": "Kolapakkam", "Kovur": "Kovur", "Manimangalam": "Manimangalam", "Pannur": "Pannur", "Irungattukottai": "Irungattukottai", "Malaipattu": "Malaipattu", "Ezhichur": "Ezhichur", "Karasangal": "Karasangal", "Ariyaperumbakkam": "Ariyaperumbakkam", "Minjur": "Minjur", "Sholavaram": "Sholavaram", "Pakkam": "Pakkam", "Poondi": "Poondi", "Aranvoyal": "Aranvoyal", "Ikkadu": "Ikkadu", "Mappedu": "Mappedu", "Putlur": "Putlur", "Sevvapet": "Sevvapet", "Thamaaraipakkam": "Thamaaraipakkam", "Gowriwakkam": "Gowriwakkam", "Agaramthen": "Agaramthen", "Polivakkam": "Polivakkam", "Keelakattalai": "Keelakattalai", "Vandalur": "Vandalur", "Mudichur": "Mudichur", "Ottiyambakkam": "Ottiyambakkam", "Moolacheri": "Moolacheri", "Pudur": "Pudur", "Kumizhi": "Kumizhi" },
    faults: {
      "Impossible reading (out of bounds)": "అసాధ్యమైన రీడింగ్ (పరిమితికి వెలుపల)",
      "Sensor stuck at same value": "సెన్సార్ ఒకే విలువ వద్ద నిలిచిపోయింది",
      "Sudden spike/drop in flow detected": "ప్రవాహంలో ఆకస్మిక పెరుగుదల/తగ్గుదల",
      "Zero flow detected": "సున్నా ప్రవాహం",
      "Extremely low flow": "చాలా తక్కువ ప్రవాహం",
      "Flow below operational threshold": "కార్యాచరణ పరిమితికి దిగువన ప్రవాహం"
    }
  },
  ml: {
    pages: {
      data_title: "Water Readings",
      alerts_title: "System Alerts",
      maintenance_title: "Maintenance Hub",
      reports_title: "System Reports",
      monitor_title: "ESP32 Live Monitor"
    },
    ui: {
      search_placeholder: "Search by ID, Water Point, Village...",
      all_statuses: "All Statuses",
      total_records: "Total Records",
      critical_faults: "Critical Faults",
      no_records: "No maintenance records found.",
      schedule_repair: "Schedule Repair",
      select_report: "Select Report Type",
      daily_report: "Daily Report",
      export_pdf: "Export as PDF",
      export_csv: "Export as CSV",
      headers: {
        reading_id: "READING ID",
        water_point: "WATER POINT",
        village: "VILLAGE",
        flow_value: "FLOW VALUE",
        usage: "USAGE",
        status: "STATUS",
        recorded_time: "RECORDED TIME",
        time: "TIME",
        priority: "PRIORITY",
        technician: "TECHNICIAN",
        cost: "COST",
        completed_at: "COMPLETED AT",
        node_id: "NODE ID",
        flow: "FLOW",
        json_payload: "JSON PAYLOAD"
      }
    },
    data: { critical: "ഗുരുതരം", high: "ഉയർന്ന", medium: "ഇടത്തരം", normal: "സാധാരണ" },
    villages: { "Gerugambakkam": "Gerugambakkam", "Kolapakkam": "Kolapakkam", "Kovur": "Kovur", "Manimangalam": "Manimangalam", "Pannur": "Pannur", "Irungattukottai": "Irungattukottai", "Malaipattu": "Malaipattu", "Ezhichur": "Ezhichur", "Karasangal": "Karasangal", "Ariyaperumbakkam": "Ariyaperumbakkam", "Minjur": "Minjur", "Sholavaram": "Sholavaram", "Pakkam": "Pakkam", "Poondi": "Poondi", "Aranvoyal": "Aranvoyal", "Ikkadu": "Ikkadu", "Mappedu": "Mappedu", "Putlur": "Putlur", "Sevvapet": "Sevvapet", "Thamaaraipakkam": "Thamaaraipakkam", "Gowriwakkam": "Gowriwakkam", "Agaramthen": "Agaramthen", "Polivakkam": "Polivakkam", "Keelakattalai": "Keelakattalai", "Vandalur": "Vandalur", "Mudichur": "Mudichur", "Ottiyambakkam": "Ottiyambakkam", "Moolacheri": "Moolacheri", "Pudur": "Pudur", "Kumizhi": "Kumizhi" },
    faults: {
      "Impossible reading (out of bounds)": "അസാധ്യമായ റീഡിംഗ് (പരിധിക്ക് പുറത്ത്)",
      "Sensor stuck at same value": "സെൻസർ ഒരേ മൂല്യത്തിൽ കുടുങ്ങി",
      "Sudden spike/drop in flow detected": "ഒഴുക്കിൽ പെട്ടെന്നുള്ള വർദ്ധനവ്/കുറവ്",
      "Zero flow detected": "പൂജ്യം ഒഴുക്ക്",
      "Extremely low flow": "വളരെ കുറഞ്ഞ ഒഴുക്ക്",
      "Flow below operational threshold": "പ്രവർത്തന പരിധിക്ക് താഴെയുള്ള ഒഴുക്ക്"
    }
  },
  kn: {
    pages: {
      data_title: "Water Readings",
      alerts_title: "System Alerts",
      maintenance_title: "Maintenance Hub",
      reports_title: "System Reports",
      monitor_title: "ESP32 Live Monitor"
    },
    ui: {
      search_placeholder: "Search by ID, Water Point, Village...",
      all_statuses: "All Statuses",
      total_records: "Total Records",
      critical_faults: "Critical Faults",
      no_records: "No maintenance records found.",
      schedule_repair: "Schedule Repair",
      select_report: "Select Report Type",
      daily_report: "Daily Report",
      export_pdf: "Export as PDF",
      export_csv: "Export as CSV",
      headers: {
        reading_id: "READING ID",
        water_point: "WATER POINT",
        village: "VILLAGE",
        flow_value: "FLOW VALUE",
        usage: "USAGE",
        status: "STATUS",
        recorded_time: "RECORDED TIME",
        time: "TIME",
        priority: "PRIORITY",
        technician: "TECHNICIAN",
        cost: "COST",
        completed_at: "COMPLETED AT",
        node_id: "NODE ID",
        flow: "FLOW",
        json_payload: "JSON PAYLOAD"
      }
    },
    data: { critical: "ಗಂಭೀರ", high: "ಹೆಚ್ಚಿನ", medium: "ಮಧ್ಯಮ", normal: "ಸಾಮಾನ್ಯ" },
    villages: { "Gerugambakkam": "Gerugambakkam", "Kolapakkam": "Kolapakkam", "Kovur": "Kovur", "Manimangalam": "Manimangalam", "Pannur": "Pannur", "Irungattukottai": "Irungattukottai", "Malaipattu": "Malaipattu", "Ezhichur": "Ezhichur", "Karasangal": "Karasangal", "Ariyaperumbakkam": "Ariyaperumbakkam", "Minjur": "Minjur", "Sholavaram": "Sholavaram", "Pakkam": "Pakkam", "Poondi": "Poondi", "Aranvoyal": "Aranvoyal", "Ikkadu": "Ikkadu", "Mappedu": "Mappedu", "Putlur": "Putlur", "Sevvapet": "Sevvapet", "Thamaaraipakkam": "Thamaaraipakkam", "Gowriwakkam": "Gowriwakkam", "Agaramthen": "Agaramthen", "Polivakkam": "Polivakkam", "Keelakattalai": "Keelakattalai", "Vandalur": "Vandalur", "Mudichur": "Mudichur", "Ottiyambakkam": "Ottiyambakkam", "Moolacheri": "Moolacheri", "Pudur": "Pudur", "Kumizhi": "Kumizhi" },
    faults: {
      "Impossible reading (out of bounds)": "ಅಸಾಧ್ಯವಾದ ಓದುವಿಕೆ (ಮಿತಿಯ ಹೊರಗೆ)",
      "Sensor stuck at same value": "ಸೆನ್ಸಾರ್ ಒಂದೇ ಮೌಲ್ಯದಲ್ಲಿ ಸಿಲುಕಿದೆ",
      "Sudden spike/drop in flow detected": "ಹರಿವಿನಲ್ಲಿ ಹಠಾತ್ ಏರಿಕೆ/ಕುಸಿತ",
      "Zero flow detected": "ಶೂನ್ಯ ಹರಿವು",
      "Extremely low flow": "ಅತ್ಯಂತ ಕಡಿಮೆ ಹರಿವು",
      "Flow below operational threshold": "ಕಾರ್ಯಾಚರಣೆಯ ಮಿತಿಗಿಂತ ಕಡಿಮೆ ಹರಿವು"
    }
  }
};

files.forEach(file => {
  const lang = file.split('.')[0];
  const filePath = path.join(localesDir, file);
  
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Merge new data
    content.data = additions[lang].data;
    content.villages = additions[lang].villages;
    content.faults = additions[lang].faults;
    content.pages = additions[lang].pages;
    content.ui = additions[lang].ui;
    
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`Updated ${file}`);
  }
});
