export const amenityCategories = {
  'Basic property features': [
    'Parking', 'Covered Parking', 'Visitor Parking', 'Balcony', 'Multiple Balconies', 'Terrace',
    'Private Garden', 'Private Pool', 'Servant Room', 'Study Room', 'Pooja Room', 'Store Room',
    'Utility Area', 'Walk-in Closet', 'Modular Kitchen', 'Wardrobes', 'Furnished Kitchen',
    'Attached Bathroom', 'Bathtub', 'Hot Water', 'Water Storage', 'Water Purifier',
  ],
  Security: [
    '24x7 Security', 'CCTV', 'Security Guard', 'Gated Community', 'Video Door Phone',
    'Intercom', 'Access Control', 'Smart Lock', 'Fire Safety', 'Fire Extinguishers',
    'Smoke Detector', 'Emergency Exit',
  ],
  'Power & utilities': [
    '24x7 Electricity', 'Power Backup', 'Generator', 'Lift Backup', 'Solar Power',
    'Solar Water Heater', 'Water Supply', 'Borewell', 'Municipal Water',
    'Rainwater Harvesting', 'Sewage Treatment Plant', 'Waste Management',
  ],
  'Lifts & accessibility': [
    'Lift', 'Multiple Lifts', 'Service Lift', 'Wheelchair Accessible', 'Ramp',
    'Accessible Parking', 'Elderly Friendly', 'Ground Floor Option',
  ],
  'Fitness & sports': [
    'Gym', 'Swimming Pool', "Children's Pool", 'Indoor Games', 'Outdoor Games',
    'Basketball Court', 'Badminton Court', 'Tennis Court', 'Football Area',
    'Cricket Practice Area', 'Jogging Track', 'Walking Track', 'Yoga Area', 'Fitness Centre',
  ],
  'Family & children': [
    "Children's Play Area", 'Kids Club', 'Day Care', 'Creche', 'Family Lounge',
    'Community Hall', 'Party Hall', 'Activity Room', 'Senior Citizen Area',
    'Senior Citizen Lounge',
  ],
  'Outdoor & relaxation': [
    'Garden', 'Landscaped Garden', 'Rooftop Garden', 'Park', 'Green Area', 'Seating Area',
    'Gazebo', 'BBQ Area', 'Open Terrace', 'Rooftop', 'Picnic Area',
  ],
  'Work & connectivity': [
    'High-Speed Internet', 'Broadband', 'Fiber Internet', 'Wi-Fi', 'Co-working Space',
    'Business Centre', 'Meeting Room', 'Work From Home Space',
  ],
  'Daily convenience': [
    'Grocery Store', 'Convenience Store', 'Pharmacy', 'ATM', 'Salon', 'Laundry',
    'Housekeeping', 'Maintenance Staff', 'Concierge', 'Delivery Area', 'Parcel Room',
    'Visitor Management',
  ],
  Transport: [
    'Public Transport Nearby', 'Bus Stop Nearby', 'Metro Nearby', 'Railway Station Nearby',
    'Airport Connectivity', 'EV Charging', 'Car Wash', 'Bicycle Parking', 'Bicycle Storage',
  ],
  Pets: ['Pet Friendly', 'Pet Park', 'Pet Area', 'Pet Washing Area'],
  'Smart home': [
    'Smart Home', 'Smart Lighting', 'Smart Door Lock', 'Smart Security', 'Smart Thermostat',
    'Smart Appliances', 'Home Automation',
  ],
  Environment: [
    'Solar Panels', 'Green Building', 'Energy Efficient', 'Natural Lighting',
    'Natural Ventilation', 'Waste Recycling',
  ],
  'Location convenience': [
    'Near School', 'Near College', 'Near University', 'Near Hospital', 'Near Grocery',
    'Near Mall', 'Near Restaurant', 'Near Public Transport', 'Near Workplace',
    'Near Airport', 'Near Railway Station', 'Near Beach', 'Near Park',
  ],
  Lifestyle: [
    'Clubhouse', 'Lounge', 'Community Centre', 'Entertainment Room', 'Theatre', 'Library',
    'Meditation Room', 'Spa', 'Sauna', 'Steam Room', 'Café', 'Restaurant',
  ],
} as const

export type AmenityCategory = keyof typeof amenityCategories
export const amenityOptions = [...new Set(Object.values(amenityCategories).flat())]
