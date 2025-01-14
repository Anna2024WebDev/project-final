import express from "express";
import axios from "axios";
// import { authenticateUser } from "../middleware/auth.js"; VI kommenterar tillbaks denna när vi lagt till routes för user
import { Playground } from "../models/playground.js";

export const router = express.Router();

// Helper function to query Google Places API
export async function fetchGooglePlacesPlaygrounds(
  lat,
  lng,
  radius = process.env.DEFAULT_RADIUS
) {
  const coordinates =
    lat && lng ? `${lat},${lng}` : process.env.STOCKHOLM_COORDINATES;

  const apiUrl = process.env.GOOGLE_PLACES_URL.replace(
    "{LAT}",
    coordinates.split(",")[0]
  )
    .replace("{LNG}", coordinates.split(",")[1])
    .replace("{RADIUS}", radius);

  try {
    const response = await axios.get(apiUrl, {
      params: { key: process.env.GOOGLE_API_KEY },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching from Google Places API:", error.message);
    throw new Error("Google Places API error");
  }
}

// Define routes
router.get("/", async (req, res) => {
  let { lat, lng, radius = 5000 } = req.query;

  console.log("Received Coordinates:", lat, lng);

  if (!lat || !lng) {
    console.log("Latitude or longitude missing, using fallback coordinates.");
    lat = process.env.STOCKHOLM_COORDINATES.split(",")[0];
    lng = process.env.STOCKHOLM_COORDINATES.split(",")[1];
  }

  try {
    const playgrounds = await fetchGooglePlacesPlaygrounds(lat, lng, radius);

    if (playgrounds.length === 0) {
      console.log(
        "No playgrounds found for provided coordinates, using fallback."
      );
      const fallbackPlaygrounds = await fetchGooglePlacesPlaygrounds(
        process.env.STOCKHOLM_COORDINATES.split(",")[0],
        process.env.STOCKHOLM_COORDINATES.split(",")[1],
        radius
      );
      return res.json(fallbackPlaygrounds);
    } else {
      // Example of saving playground data to database
      const savedPlaygrounds = await Playground.insertMany(playgrounds);
      return res.json(savedPlaygrounds);
    }
  } catch (error) {
    console.error("Error fetching playground data:", error);
    res.status(500).json({ error: "Failed to fetch playground data" });
  }
});

router.get("/id/:place_id", async (req, res) => {
  const { place_id } = req.params;
  const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.GOOGLE_API_KEY}`;
  try {
    const response = await axios.get(apiUrl);
    const playgroundDetails = response.data.result;
    if (!playgroundDetails) {
      res.status(404).json({ message: "Playground not found" });
    } else {
      res.json(playgroundDetails);
    }
  } catch (error) {
    console.error("Error fetching from Google Places API:", error.message);
    res.status(500).send("Error fetching from Google Places API");
  }
});

// import express from "express";
// import axios from "axios";
// import { authenticateUser } from "../middleware/auth.js";
// import { Playground } from "../models/playground.js";

// export const router = express.Router();

// // Helper function to query Google Places API
// async function fetchGooglePlacesPlaygrounds(
//   lat,
//   lng,
//   radius = process.env.DEFAULT_RADIUS
// ) {
//   // Use default coordinates if lat/lng is not provided
//   const coordinates =
//     lat && lng ? `${lat},${lng}` : process.env.STOCKHOLM_COORDINATES;

//   // Replace placeholders in the URL
//   const apiUrl = process.env.GOOGLE_PLACES_URL.replace(
//     "{LAT}",
//     coordinates.split(",")[0]
//   )
//     .replace("{LNG}", coordinates.split(",")[1])
//     .replace("{RADIUS}", radius);

//   try {
//     const response = await axios.get(apiUrl, {
//       params: { key: process.env.GOOGLE_API_KEY },
//     });
//     return response.data.results;
//   } catch (error) {
//     console.error("Error fetching from Google Places API:", error.message);
//     throw new Error("Google Places API error");
//   }
// }

// module.exports = { fetchGooglePlacesPlaygrounds };

// router.get("/", async (req, res) => {
//   // Destructure coordinates and radius from query params
//   let { lat, lng, radius = 5000 } = req.query;

//   // Log received coordinates for debugging
//   console.log("Received Coordinates:", lat, lng);

//   // If lat or lng are missing, use fallback coordinates (Stockholm) instead
//   if (!lat || !lng) {
//     console.log("Latitude or longitude missing, using fallback coordinates.");
//     lat = process.env.STOCKHOLM_COORDINATES.split(",")[0];
//     lng = process.env.STOCKHOLM_COORDINATES.split(",")[1];
//   }

//   try {
//     // Fetch playground data based on coordinates (either provided or fallback)
//     const playgrounds = await fetchGooglePlacesPlaygrounds(lat, lng, radius);

//     // If no playgrounds found, return the fetched data
//     if (playgrounds.length === 0) {
//       console.log(
//         "No playgrounds found for provided coordinates, using fallback."
//       );
//       // Use fallback coordinates again if no playgrounds found for the initial coordinates
//       const fallbackPlaygrounds = await fetchGooglePlacesPlaygrounds(
//         process.env.STOCKHOLM_COORDINATES.split(",")[0],
//         process.env.STOCKHOLM_COORDINATES.split(",")[1],
//         radius
//       );
//       return res.json(fallbackPlaygrounds);
//     } else {
//       return res.json(playgrounds);
//     }
//   } catch (error) {
//     console.error("Error fetching playground data:", error);
//     res.status(500).json({ error: "Failed to fetch playground data" });
//   }
// });

// // Additional routes (e.g., by ID or POST) remain unchanged
// router.get("/id/:place_id", async (req, res) => {
//   const { place_id } = req.params;
//   const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.GOOGLE_API_KEY}`;
//   try {
//     const response = await axios.get(apiUrl);
//     const playgroundDetails = response.data.result;
//     if (!playgroundDetails) {
//       res.status(404).json({ message: "Playground not found" });
//     } else {
//       res.json(playgroundDetails);
//     }
//   } catch (error) {
//     console.error("Error fetching from Google Places API:", error.message);
//     res.status(500).send("Error fetching from Google Places API");
//   }
// });

// router.get("/", async (req, res) => {
//   const { lat, lng, radius = 5000 } = req.query;

//   console.log("Received Coordinates:", lat, lng);

//   if (!lat || !lng) {
//     return res
//       .status(400)
//       .json({ error: "Latitude and longitude are required" });
//   }
//   try {
//     const playgrounds = await fetchGooglePlacesPlaygrounds(lat, lng, radius);

//     if (playgrounds.length === 0) {
//       console.log(
//         "No playgrounds found for provided coordinates, using fallback."
//       );
//       const fallbackPlaygrounds = await fetchGooglePlacesPlaygrounds(
//         process.env.STOCKHOLM_COORDINATES.split(",")[0],
//         process.env.STOCKHOLM_COORDINATES.split(",")[1],
//         radius
//       );
//       res.json(fallbackPlaygrounds);
//     } else {
//       res.json(playgrounds);
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch playground data" });
//   }
// });

// Get all playgrounds -> this is using mongoDB logic and not the google places api so i will comment this out for now :) /Fanny

// app.get("/api/playgrounds", async (req, res) => {
//   try {
//     const playgrounds = await Playground.find();
//     res.json(playgrounds);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error retrieving playgrounds" });
//   }
// });

// router.get("/", async (req, res) => {
//   // Extracting query params
//   const { name, location } = req.query;
//   let apiUrl = `${process.env.GOOGLE_PLACES_URL}?&key=${process.env.GOOGLE_API_KEY}`; // Initial URL, using let instead of const to be able to modify/reassign the value of the url using query params
//   // Query param for name - the playground name or the neighborhood name (ex. playground)
//   if (name) {
//     apiUrl = `${process.env.GOOGLE_PLACES_URL}?query=playground+in+${name}&key=${process.env.GOOGLE_API_KEY}`;
//   }
//   // change this to postal code?
//   if (location) {
//     const [lat, lng] = location.split(",").map((coord) => coord.trim());
//     const radius = 100;
//     // Constructing the API URL with location and radius
//     apiUrl = `${process.env.GOOGLE_PLACES_URL}?location=${lat},${lng}&radius=${radius}&types=playground&key=${process.env.GOOGLE_API_KEY}`;
//   }
//   // Fetching data using axios
//   try {
//     const response = await axios.get(apiUrl);
//     const playgrounds = response.data.results;
//     if (playgrounds.length === 0) {
//       res.status(404).json({ message: "Sorry - no playgrounds found" });
//     } else {
//       res.json(playgrounds); //getting the data for all playgrounds
//     }
//   } catch (error) {
//     console.error("Error fetching data from the external API", error.message);
//     res
//       .status(500)
//       .send(
//         "Error fetching data from the external API",
//         error.response?.data || error.message
//       );
//   }
// });

// // Get playgrounds near a given location
// router.get("/near", async (req, res) => {
//   try {
//     const { lat, lon, maxDistance = 5000 } = req.query; // Default to 5 km radius
//     const coordinates = [lon, lat]; // Ensure that coordinates are in [longitude, latitude] order

//     const playgrounds = await Playground.find({
//       location: {
//         $near: {
//           $geometry: { type: "Point", coordinates },
//           $maxDistance: maxDistance,
//         },
//       },
//     });
//     res.json(playgrounds);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error finding nearby playgrounds" });
//   }
// });

// // Get a specific playground by ID -> this is using mongoDB logic and not the google places api so i will comment this out for now :) /Fanny
// // app.get("/api/playgrounds/:id", async (req, res) => {
// //   try {
// //     const playground = await Playground.findById(req.params.id);
// //     if (!playground) {
// //       return res.status(404).json({ error: "Playground not found" });
// //     }
// //     res.json(playground);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ error: "Error retrieving playground" });
// //   }
// // });

// // Route to fetch playground details by ID from Google Places API
// router.get("/id/:place_id", async (req, res) => {
//   const { place_id } = req.params; // Extracting place_id from URL params
//   const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.GOOGLE_API_KEY}`;
//   try {
//     const response = await axios.get(apiUrl);
//     const playgroundDetails = response.data.result;
//     if (!playgroundDetails) {
//       res.status(404).json({ message: "Playground not found" });
//     } else {
//       res.json(playgroundDetails);
//     }
//   } catch (error) {
//     console.error(
//       "Error fetching data from the Google Places API",
//       error.message
//     );
//     res.status(500).send("Error fetching data from the Google Places API");
//   }
// });

// //route to post a playground
// router.post("/", authenticateUser, async (req, res) => {
//   const { name, description, address, facilities, images } = req.body;
//   try {
//     const newPlayground = new Playground({
//       name,
//       description,
//       address,
//       facilities,
//       images,
//       postedBy: req.user._id,
//     });
//     await newPlayground.save();
//     res.status(201).json({
//       success: true,
//       message: "Playground created successfully",
//       playground: newPlayground,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Internal server error", error });
//   }
// });

// export default router;

// Create a new playground
// app.post("/api/playgrounds", async (req, res) => {
//   try {
//     const { name, address, source, facilities, images, ratings, googlePlaceId, postedBy, coordinates } = req.body;

//     // Create a new playground document
//     const newPlayground = new Playground({
//       name,
//       address,
//       source,
//       facilities,
//       images,
//       ratings,
//       googlePlaceId,
//       postedBy,
//       location: {
//         type: 'Point',
//         coordinates: coordinates // expects [longitude, latitude]
//       }
//     });

// Save the playground to the database
//     const savedPlayground = await newPlayground.save();
//     res.status(201).json(savedPlayground);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error creating playground" });
//   }
// });

// Helper function to query Google Places API
// async function fetchGooglePlacesPlaygrounds(lat, lng, radius = 500) {
//   const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=park&keyword=playground&key=${process.env.GOOGLE_API_KEY}`;
//   try {
//     const response = await axios.get(apiUrl);
//     return response.data.results;
//   } catch (error) {
//     console.error("Error fetching from Google Places API:", error.message);
//     throw new Error("Google Places API error");
//   }
// }

// // Helper function to query Overpass Turbo API
// async function fetchOverpassPlaygrounds(bbox) {
//   const query = `
//     [out:json][timeout:25];
//     node["leisure"="playground"](${bbox});
//     out body;
//   `;
//   const apiUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
//     query
//   )}`;
//   try {
//     const response = await axios.get(apiUrl);
//     return response.data.elements;
//   } catch (error) {
//     console.error("Error fetching from Overpass Turbo API:", error.message);
//     throw new Error("Overpass Turbo API error");
//   }
// }

// Unified route to get playgrounds from both APIs
// router.get("/combined", async (req, res) => {
//   const { lat, lng, radius = 500 } = req.query;

//   if (!lat || !lng) {
//     return res
//       .status(400)
//       .json({ error: "Latitude and longitude are required" });
//   }

//   // Define a bounding box for Overpass API based on the radius
//   const bbox = `${lat - 0.05},${lng - 0.05},${lat + 0.05},${lng + 0.05}`; // Adjust as needed

//   try {
//     // Fetch data from both APIs concurrently
//     const [googlePlaygrounds, overpassPlaygrounds] = await Promise.all([
//       fetchGooglePlacesPlaygrounds(lat, lng, radius),
//       fetchOverpassPlaygrounds(bbox),
//     ]);

//     // Normalize and combine the data
//     const combinedResults = [
//       ...googlePlaygrounds.map((place) => ({
//         name: place.name,
//         location: place.geometry.location,
//         source: "Google Places",
//       })),
//       ...overpassPlaygrounds.map((node) => ({
//         name: node.tags.name || "Unnamed Playground",
//         location: { lat: node.lat, lng: node.lon },
//         source: "OpenStreetMap",
//       })),
//     ];

//     if (combinedResults.length === 0) {
//       res.status(404).json({ message: "No playgrounds found" });
//     } else {
//       res.json(combinedResults);
//     }
//   } catch (error) {
//     console.error("Error fetching playgrounds:", error.message);
//     res.status(500).json({ error: "Failed to fetch playground data" });
//   }
// });

// 59.5114531 / 18.0824075

// http://localhost:9000/api/playgrounds?lat=59.5114531&lng=18.0824075
