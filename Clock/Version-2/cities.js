const CITIES = [
  // UTC-08:00
  { city: "Los Angeles", zone: "America/Los_Angeles", country: "USA", offset: "-08:00" },
  { city: "San Francisco", zone: "America/Los_Angeles", country: "USA", offset: "-08:00" },
  { city: "Vancouver", zone: "America/Vancouver", country: "Canada", offset: "-08:00" },
  { city: "Tijuana", zone: "America/Tijuana", country: "Mexico", offset: "-08:00" },

  // UTC-07:00
  { city: "Denver", zone: "America/Denver", country: "USA", offset: "-07:00" },
  { city: "Edmonton", zone: "America/Edmonton", country: "Canada", offset: "-07:00" },
  { city: "Phoenix", zone: "America/Phoenix", country: "USA", offset: "-07:00" },
  { city: "Chihuahua", zone: "America/Chihuahua", country: "Mexico", offset: "-07:00" },

  // UTC-06:00
  { city: "Chicago", zone: "America/Chicago", country: "USA", offset: "-06:00" },
  { city: "Houston", zone: "America/Chicago", country: "USA", offset: "-06:00" },
  { city: "Winnipeg", zone: "America/Winnipeg", country: "Canada", offset: "-06:00" },
  { city: "Mexico City", zone: "America/Mexico_City", country: "Mexico", offset: "-06:00" },
  { city: "Guatemala City", zone: "America/Guatemala", country: "Guatemala", offset: "-06:00" },

  // UTC-05:00
  { city: "New York", zone: "America/New_York", country: "USA", offset: "-05:00" },
  { city: "Toronto", zone: "America/Toronto", country: "Canada", offset: "-05:00" },
  { city: "Lima", zone: "America/Lima", country: "Peru", offset: "-05:00" },
  { city: "Bogotá", zone: "America/Bogota", country: "Colombia", offset: "-05:00" },
  { city: "Havana", zone: "America/Havana", country: "Cuba", offset: "-05:00" },
  { city: "Kingston", zone: "America/Jamaica", country: "Jamaica", offset: "-05:00" },

  // UTC+00:00 (GMT)
  { city: "London", zone: "Europe/London", country: "United Kingdom", offset: "+00:00" },
  { city: "Dublin", zone: "Europe/Dublin", country: "Ireland", offset: "+00:00" },
  { city: "Lisbon", zone: "Europe/Lisbon", country: "Portugal", offset: "+00:00" },
  { city: "Reykjavik", zone: "Atlantic/Reykjavik", country: "Iceland", offset: "+00:00" },
  { city: "Casablanca", zone: "Africa/Casablanca", country: "Morocco", offset: "+00:00" },
  { city: "Abidjan", zone: "Africa/Abidjan", country: "Ivory Coast", offset: "+00:00" },

  // UTC+01:00
  { city: "Paris", zone: "Europe/Paris", country: "France", offset: "+01:00" },
  { city: "Berlin", zone: "Europe/Berlin", country: "Germany", offset: "+01:00" },
  { city: "Madrid", zone: "Europe/Madrid", country: "Spain", offset: "+01:00" },
  { city: "Rome", zone: "Europe/Rome", country: "Italy", offset: "+01:00" },
  { city: "Brussels", zone: "Europe/Brussels", country: "Belgium", offset: "+01:00" },
  { city: "Warsaw", zone: "Europe/Warsaw", country: "Poland", offset: "+01:00" },
  { city: "Vienna", zone: "Europe/Vienna", country: "Austria", offset: "+01:00" },

  // UTC+02:00
  { city: "Athens", zone: "Europe/Athens", country: "Greece", offset: "+02:00" },
  { city: "Cairo", zone: "Africa/Cairo", country: "Egypt", offset: "+02:00" },
  { city: "Helsinki", zone: "Europe/Helsinki", country: "Finland", offset: "+02:00" },
  { city: "Johannesburg", zone: "Africa/Johannesburg", country: "South Africa", offset: "+02:00" },
  { city: "Bucharest", zone: "Europe/Bucharest", country: "Romania", offset: "+02:00" },
  { city: "Kyiv", zone: "Europe/Kyiv", country: "Ukraine", offset: "+02:00" },
  { city: "Istanbul", zone: "Europe/Istanbul", country: "Turkey", offset: "+03:00" },

  // UTC+03:00
  { city: "Moscow", zone: "Europe/Moscow", country: "Russia", offset: "+03:00" },
  { city: "Nairobi", zone: "Africa/Nairobi", country: "Kenya", offset: "+03:00" },
  { city: "Baghdad", zone: "Asia/Baghdad", country: "Iraq", offset: "+03:00" },
  { city: "Riyadh", zone: "Asia/Riyadh", country: "Saudi Arabia", offset: "+03:00" },
  { city: "Doha", zone: "Asia/Qatar", country: "Qatar", offset: "+03:00" },

  // UTC+03:30
  { city: "Tehran", zone: "Asia/Tehran", country: "Iran", offset: "+03:30" },

  // UTC+04:00
  { city: "Dubai", zone: "Asia/Dubai", country: "United Arab Emirates", offset: "+04:00" },
  { city: "Baku", zone: "Asia/Baku", country: "Azerbaijan", offset: "+04:00" },
  { city: "Tbilisi", zone: "Asia/Tbilisi", country: "Georgia", offset: "+04:00" },

  // UTC+04:30
  { city: "Kabul", zone: "Asia/Kabul", country: "Afghanistan", offset: "+04:30" },

  // UTC+05:00
  { city: "Karachi", zone: "Asia/Karachi", country: "Pakistan", offset: "+05:00" },
  { city: "Tashkent", zone: "Asia/Tashkent", country: "Uzbekistan", offset: "+05:00" },
  { city: "Ashgabat", zone: "Asia/Ashgabat", country: "Turkmenistan", offset: "+05:00" },
  { city: "Yekaterinburg", zone: "Asia/Yekaterinburg", country: "Russia", offset: "+05:00" },

  // UTC+05:30
  { city: "Delhi", zone: "Asia/Kolkata", country: "India", offset: "+05:30" },
  { city: "Mumbai", zone: "Asia/Kolkata", country: "India", offset: "+05:30" },
  { city: "Chennai", zone: "Asia/Kolkata", country: "India", offset: "+05:30" },
  { city: "Bangalore", zone: "Asia/Kolkata", country: "India", offset: "+05:30" },
  { city: "Kolkata", zone: "Asia/Kolkata", country: "India", offset: "+05:30" },
  { city: "Hyderabad", zone: "Asia/Kolkata", country: "India", offset: "+05:30" },

  // UTC+05:45
  { city: "Kathmandu", zone: "Asia/Kathmandu", country: "Nepal", offset: "+05:45" },

  // UTC+06:00
  { city: "Dhaka", zone: "Asia/Dhaka", country: "Bangladesh", offset: "+06:00" },
  { city: "Almaty", zone: "Asia/Almaty", country: "Kazakhstan", offset: "+06:00" },
  { city: "Bishkek", zone: "Asia/Bishkek", country: "Kyrgyzstan", offset: "+06:00" },

  // UTC+06:30
  { city: "Yangon", zone: "Asia/Yangon", country: "Myanmar", offset: "+06:30" },

  // UTC+07:00
  { city: "Bangkok", zone: "Asia/Bangkok", country: "Thailand", offset: "+07:00" },
  { city: "Hanoi", zone: "Asia/Bangkok", country: "Vietnam", offset: "+07:00" },
  { city: "Jakarta", zone: "Asia/Jakarta", country: "Indonesia", offset: "+07:00" },
  { city: "Ho Chi Minh City", zone: "Asia/Ho_Chi_Minh", country: "Vietnam", offset: "+07:00" },

  // UTC+08:00
  { city: "Beijing", zone: "Asia/Shanghai", country: "China", offset: "+08:00" },
  { city: "Shanghai", zone: "Asia/Shanghai", country: "China", offset: "+08:00" },
  { city: "Hong Kong", zone: "Asia/Hong_Kong", country: "Hong Kong", offset: "+08:00" },
  { city: "Singapore", zone: "Asia/Singapore", country: "Singapore", offset: "+08:00" },
  { city: "Kuala Lumpur", zone: "Asia/Kuala_Lumpur", country: "Malaysia", offset: "+08:00" },
  { city: "Perth", zone: "Australia/Perth", country: "Australia", offset: "+08:00" },
  { city: "Manila", zone: "Asia/Manila", country: "Philippines", offset: "+08:00" },

  // UTC+09:00
  { city: "Tokyo", zone: "Asia/Tokyo", country: "Japan", offset: "+09:00" },
  { city: "Osaka", zone: "Asia/Tokyo", country: "Japan", offset: "+09:00" },
  { city: "Seoul", zone: "Asia/Seoul", country: "South Korea", offset: "+09:00" },
  { city: "Pyongyang", zone: "Asia/Pyongyang", country: "North Korea", offset: "+09:00" },

  // UTC+09:30
  { city: "Darwin", zone: "Australia/Darwin", country: "Australia", offset: "+09:30" },
  { city: "Adelaide", zone: "Australia/Adelaide", country: "Australia", offset: "+09:30" },

  // UTC+10:00
  { city: "Sydney", zone: "Australia/Sydney", country: "Australia", offset: "+10:00" },
  { city: "Melbourne", zone: "Australia/Melbourne", country: "Australia", offset: "+10:00" },
  { city: "Brisbane", zone: "Australia/Brisbane", country: "Australia", offset: "+10:00" },
  { city: "Port Moresby", zone: "Pacific/Port_Moresby", country: "Papua New Guinea", offset: "+10:00" },

  // UTC+12:00
  { city: "Auckland", zone: "Pacific/Auckland", country: "New Zealand", offset: "+12:00" },
  { city: "Wellington", zone: "Pacific/Auckland", country: "New Zealand", offset: "+12:00" },
  { city: "Fiji", zone: "Pacific/Fiji", country: "Fiji", offset: "+12:00" }
];