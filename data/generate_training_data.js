const fs = require('fs');
const path = require('path');

const ROW_COUNT = 100;

const texasCities = [
    'Los Angeles', 'New York', 'Chicago', 'San Francisco', 'Miami', 
    'Boston', 'Seattle', 'Denver', 'Austin', 'Toronto', 
    'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Montreal', 
    'Knoxville', 'Nashville', 'Mexico City', 'San Diego', 'San Jose'
];

// --- 1. RESTAURANTS ---
const resCats = ['BBQ', 'Tex-Mex', 'Steakhouse', 'Seafood', 'Southern', 'Bistro'];
const resNames = ['Lone Star', 'Big Tex', 'Blue Bonnet', 'Yellow Rose', 'Alamo', 'Pecos'];
const resNouns = ['Pit', 'Grill', 'Kitchen', 'Taqueria', 'Smokehouse', 'Table'];

function generateRestaurantRow(id) {
    const city = texasCities[id % texasCities.length];
    const cat = resCats[id % resCats.length];
    const name = `${resNames[id % resNames.length]} ${resNouns[id % resNouns.length]} of ${city} #${id}`;
    const price = ['$', '$$', '$$$', '$$$$'][id % 4];
    const rating = (3.5 + (Math.random() * 1.5)).toFixed(1);
    return { City: city, Name: name, Category: cat, Price: price, Rating: rating };
}

// --- 2. ATTRACTIONS ---
const attrCats = ['Museum', 'Park', 'Historical Site', 'Theme Park', 'Landmark', 'Nature'];
const attrNames = ['Heritage', 'Victory', 'Discovery', 'Liberty', 'Frontier', 'Grand'];
const attrTypes = ['Center', 'Plaza', 'Gardens', 'Monument', 'Preserve', 'Hall'];

function generateAttractionRow(id) {
    const city = texasCities[id % texasCities.length];
    const cat = attrCats[id % attrCats.length];
    const name = `${attrNames[id % attrNames.length]} ${attrTypes[id % attrTypes.length]} of ${city} #${id}`;
    const price = (Math.random() * 50).toFixed(2);
    const rating = (4.0 + (Math.random() * 1.0)).toFixed(1);
    return { City: city, Name: name, Category: cat, Admission: `$${price}`, Rating: rating };
}

// --- 3. HOTELS ---
const hotelCats = ['Luxury', 'Budget', 'Boutique', 'Ranch', 'Suites', 'Inn'];
const hotelBrands = ['Magnolia', 'Cactus', 'Saddle', 'River', 'Star', 'Crest'];
const hotelTypes = ['Hotel', 'Resort', 'Lodge', 'Manor', 'Courtyard', 'Suites'];

function generateHotelRow(id) {
    const city = texasCities[id % texasCities.length];
    const cat = hotelCats[id % hotelCats.length];
    const name = `${hotelBrands[id % hotelBrands.length]} ${hotelTypes[id % hotelTypes.length]} ${city} #${id}`;
    const rate = (70 + (Math.random() * 400)).toFixed(0);
    const amenities = ['Pool, WiFi', 'Gym, Breakfast', 'Spa, Bar', 'Parking, Pets'][id % 4];
    return { City: city, Name: name, Category: cat, Rate: `$${rate}/night`, Amenities: amenities };
}

// --- 4. FLIGHTS ---
const airlines = ['Southwest', 'American Airlines', 'United', 'Delta', 'JetBlue'];

function generateFlightRow(id) {
    const origin = texasCities[id % texasCities.length];
    let dest = texasCities[(id + 5) % texasCities.length]; // Ensure offset so they differ
    
    // Fallback in case they collide (unlikely with id+5 but safe)
    if (origin === dest) dest = texasCities[0] === origin ? texasCities[1] : texasCities[0];

    const airline = airlines[id % airlines.length];
    const flightNum = `TX${1000 + id}`;
    const price = (150 + (Math.random() * 500)).toFixed(2);
    const duration = `${(2 + Math.random() * 3).toFixed(1)}h`;
    return { Origin: origin, Destination: dest, Airline: airline, Flight_No: flightNum, Price: `$${price}`, Duration: duration };
}

function generate(filename, rowGen) {
    const data = [];
    for (let i = 1; i <= ROW_COUNT; i++) {
        data.push(rowGen(i));
    }
    fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2));
    console.log(`Saved ${filename}`);
}

generate('restaurants.json', generateRestaurantRow);
generate('attractions.json', generateAttractionRow);
generate('hotels.json', generateHotelRow);
generate('flights.json', generateFlightRow);

// --- 5. METADATA --- Generate a single source-of-truth for all unique filterable values.
// This file is small and perfectly structured, making it immune to Azure chunk boundary issues.
const metadata = {
    cities: [...new Set(texasCities)].sort(),
    flight_origins: [...new Set(texasCities)].sort(),
    flight_destinations: [...new Set(texasCities)].sort(),
    restaurant_categories: [...new Set(resCats)].sort(),
    restaurant_prices: ['$', '$$', '$$$', '$$$$'],
    attraction_categories: [...new Set(attrCats)].sort(),
    hotel_categories: [...new Set(hotelCats)].sort(),
    airlines: [...new Set(airlines)].sort(),
};

fs.writeFileSync(path.join(__dirname, 'metadata.json'), JSON.stringify(metadata, null, 2));
console.log('Saved metadata.json');
