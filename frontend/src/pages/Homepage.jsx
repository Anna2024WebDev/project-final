import Lottie from "lottie-react";
import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { MapLoader } from "../components/MapLoader";
import { getUserLocation } from "../hooks/getUserLocation";
import { usePlaygroundStore } from "../stores/usePlaygroundStore";
import loadingAnimation from "../assets/Animation - 1739129648764.json";
import { Text } from "../ui/Typography";
import { useLocation, useNavigate } from "react-router-dom";

const StyledText = styled(Text)`
  font-size: 1.6rem;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    font-size: 1.2rem; 
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; 
  padding-top: 100px; 

  @media (max-width: 480px) {
    padding-top: 50px;
  }
`;

const SearchMapContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
`;

const SearchBarContainer = styled.div`
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background: white;
  opacity: 95%; 
  border-radius: 15px;
  border: solid #F9629F; 
  &:hover {
    border: solid #E6FA54; 
  }
  padding: 8px 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 80%; 
  display: ${({ $isMenuOpen }) => ($isMenuOpen ? "none" : "flex")};

  @media (min-width: 768px) {
    width: 400px; 
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 8px;
  font-size: 1rem;
  border-radius: 25px;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #7e7d7d;
  cursor: pointer;

  &:hover {
    color: #000;
  }
`;

export const Homepage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [playgrounds, setPlaygrounds] = useState([]);
  const [address, setAddress] = useState("");
  const [isFetchingData, setIsFetchingData] = useState(true);
  const isMenuOpen = usePlaygroundStore((state) => state.isMenuOpen);
  const searchQuery = usePlaygroundStore((state) => state.searchQuery);
  const setSearchQuery = usePlaygroundStore((state) => state.setSearchQuery);
  const { search } = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(search);
  const searchQueryFromUrl = queryParams.get("search") || "";

  // Update the store and local input if URL has a search query.
  useEffect(() => {
    if (searchQueryFromUrl && searchQueryFromUrl !== searchQuery) {
      console.log("Updating search query from URL:", searchQueryFromUrl);
      setSearchQuery(searchQueryFromUrl);
      setAddress(searchQueryFromUrl);
    }
  }, [searchQueryFromUrl, searchQuery, setSearchQuery]);

  // Always fetch user location on mount so MapLoader can center the map.
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        console.error("Error fetching user location:", error.message);
      }
    };
    fetchUserLocation();
  }, []);

  // Fetch playgrounds based on search query (if available) or by location.
  useEffect(() => {
    setIsFetchingData(true);

    const fetchPlaygroundsBySearch = async (query) => {
      // Check localStorage for cached results.
      const cacheKey = `playgroundResults_${query}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.log("Using cached results for query:", query);
        setPlaygrounds(JSON.parse(cached));
        setIsFetchingData(false);
        return;
      }
      console.log("Triggering API call for search query:", query);
      try {
        const radius = 2000;
        const url = `https://project-playgroundfinder-api.onrender.com/api/playgrounds?name=${encodeURIComponent(query)}&radius=${radius}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch playgrounds.");
        }
        const data = await response.json();
        setPlaygrounds(data || []);
        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error("Search Error:", error.message);
        alert("Failed to fetch playground data.");
      } finally {
        setIsFetchingData(false);
      }
    };

    const fetchLocationAndPlaygrounds = async () => {
      try {
        if (!userLocation) throw new Error("User location not available");
        const { lat, lng } = userLocation;
        const response = await fetch(
          `https://project-playgroundfinder-api.onrender.com/api/playgrounds?lat=${lat}&lng=${lng}`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Request-Method": "GET",
              "Access-Control-Request-Headers": "Content-Type",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch playgrounds: ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setPlaygrounds(data);
        } else {
          throw new Error("Invalid playgrounds data format");
        }
      } catch (error) {
        console.error("Error fetching location or playgrounds:", error.message);
      } finally {
        setIsFetchingData(false);
      }
    };

    if (searchQuery) {
      fetchPlaygroundsBySearch(searchQuery);
    } else if (userLocation) {
      fetchLocationAndPlaygrounds();
    }
  }, [searchQuery, userLocation]);

  const handleSearch = async () => {
    if (!address.trim()) {
      alert("Please enter a valid search term");
      return;
    }
    // Persist the search query in the store.
    setSearchQuery(address);
    console.log("Searching for playgrounds with address:", address);
    // The effect above will trigger the API call or cache check.
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSearch();
    }
  };

  if (isFetchingData) {
    return (
      <LoaderContainer>
        <StyledText>Loading Playground Map...</StyledText>
        <Lottie animationData={loadingAnimation} loop={true} />
      </LoaderContainer>
    );
  }

  return (
    <SearchMapContainer>
      <SearchBarContainer $isMenuOpen={isMenuOpen}>
        <SearchInput
          type="text"
          placeholder="Search for a playground..."
          value={address}
          onKeyDown={handleKeyDown}
          onChange={(event) => setAddress(event.target.value)}
        />
        {address && (
          <ClearButton onClick={() => setAddress("")} aria-label="Clear">
            X
          </ClearButton>
        )}
      </SearchBarContainer>
      {userLocation && (
        <MapLoader
          userLocation={userLocation}
          playgrounds={playgrounds}
          searchQuery={searchQuery}
          isFetchingData={isFetchingData}
        />
      )}
    </SearchMapContainer>
  );
};


const handleHomeClick = useCallback(() => {
  // Clear the persisted search query so that the homepage uses geolocation next time
  setSearchQuery("");
}, [setSearchQuery]);