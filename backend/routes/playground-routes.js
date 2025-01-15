import express from "express";
import axios from "axios";
import { authenticateUser } from "../middleware/auth.js";
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
  let { lat, lng, radius = 2000 } = req.query;

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
      // Process playground data to match MongoDB schema
      const processedPlaygrounds = playgrounds.map((place) => {
        const { geometry } = place;
        const location = {
          type: "Point",
          coordinates: [geometry.location.lng, geometry.location.lat],
        };

        return {
          name: place.name,
          description: place.description || "",
          address: place.vicinity || "",
          source: "Google",
          facilities: place.types || [],
          ratings: place.rating || 1,
          googlePlaceId: place.place_id,
          location,
        };
      });

      const savedPlaygrounds = await Playground.insertMany(
        processedPlaygrounds
      );
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


router.post("/", authenticateUser, async (req, res) => {
  const { name, description, address, facilities, images, location } = req.body;
  //checks if there is a location with coordinates provided, if not it will use the fallback location which is null
  const validLocation = location && Array.isArray(location.coordinates) && location.coordinates.length === 2
    ? location
    : { type: "Point", coordinates: [0, 0] };
  try {
    const newPlayground = new Playground({
      name,
      description,
      address,
      facilities,
      images,
      location: validLocation,
      postedBy: req.user._id,
    });
    await newPlayground.save();
    res.status(201).json({
      success: true,
      message: "Playground created successfully",
      playground: newPlayground,
    });
    await newPlayground.save();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
});

// 59.5114531 / 18.0824075

// http://localhost:9000/api/playgrounds?lat=59.5114531&lng=18.0824075
