document.getElementById('searchBtn').addEventListener('click', async () => {
  const category = document.getElementById('category').value;
  const location = document.getElementById('location').value.toLowerCase();
  const container = document.getElementById('collegeResults');

  container.innerHTML = "";

  if (!category) {
    alert("Please select a category");
    return;
  }

  // Base URL of the CollegeAPI
  const baseURL = "https://collegeapi-cluelesscommunity.herokuapp.com"; 
  // Note: you will need to find the correct deployed URL of the API

  // Construct endpoint
  let endpoint = "";
  // category mapping if needed
  // E.g. “medical” in your dropdown corresponds to /medical_colleges in API
  if (category === "engineering") {
    endpoint = "/engineering_colleges";
  } else if (category === "medical") {
    endpoint = "/medical_colleges";
  } else if (category === "management") {
    endpoint = "/management_colleges";
  } else if (category === "arts") {
    endpoint = "/colleges";  // or an endpoint that returns arts
  } else if (category === "commerce") {
    endpoint = "/colleges"; // same
  } else {
    endpoint = "/colleges";
  }

  // add location params
  let url = baseURL + endpoint;
  // e.g. API provides query parameters or city/state parameters
  // Check API documentation: maybe &state=... or /state={state}
  if (location) {
    // try with city param
    url += `?state=${encodeURIComponent(location)}`;
    // or `?city=` depending on API
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response not ok");
    }
    const data = await response.json();

    if (!data || data.length === 0) {
      container.innerHTML = "<p>No colleges found.</p>";
      return;
    }

    data.forEach(college => {
      const card = document.createElement('div');
      card.className = 'college-card';
      // Use placeholder image
      card.innerHTML = `
        <img src="https://via.placeholder.com/120x80?text=College" alt="${college.name || college.college_name}">
        <div class="college-info">
          <h3>${college.name || college.college_name}</h3>
          ${
            college.state 
            ? `<p><strong>State:</strong> ${college.state}</p>` 
            : ''
          }
          ${
            college.city 
            ? `<p><strong>City:</strong> ${college.city}</p>` 
            : ''
          }
          ${
            college.nirf_rank 
            ? `<p><strong>NIRF Rank:</strong> ${college.nirf_rank}</p>` 
            : ''
          }
          <p><a href="${college.website || college.url || '#'}" target="_blank">Visit Website</a></p>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error fetching data");
  }
});
