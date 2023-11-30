import { initHeatMap, initMap } from './init';
import './style.css';

async function getHeatMapData({ areaCode, startTime, endTime }: { areaCode?: number, startTime?: string, endTime?: string }) {
  
  let url = `http://${window.location.hostname}/locations`
  if (areaCode && areaCode > 0) {
    url += "?area_id=" + areaCode;
  }
  if (startTime && endTime) {
    url += (areaCode && areaCode > 0) ? "&" : "?";
    url += "start=" + startTime + "&end=" + endTime;
  }

  var res = await fetch(url)
  let locations = await res.json()

  let heatmapData: google.maps.LatLng[] =
    locations.map((location: any) => new google.maps.LatLng(location.lat, location.long))

  return heatmapData;
}

const map = await initMap();
const heatmap = await initHeatMap(map);

async function updateHeatmap() {
  const areaSelect = document.getElementById("area") as HTMLSelectElement;
  const startInput = document.getElementById("start") as HTMLInputElement;
  const endInput = document.getElementById("end") as HTMLInputElement;

  const areaCode = parseInt(areaSelect.value);
  const startTime = startInput.value;
  const endTime = endInput.value;

  const heatmapData = await getHeatMapData({ areaCode, startTime, endTime });

  heatmap.setData(heatmapData);
}

updateHeatmap();

document.querySelectorAll("#updateBtn").forEach((btn) => btn.addEventListener("click", () => {
  updateHeatmap();
  updateAreaInfo();
}));

document.getElementById("clearBtn")!.addEventListener("click", () => {
  const areaSelect = document.getElementById("area") as HTMLSelectElement;
  const startInput = document.getElementById("start") as HTMLInputElement;
  const endInput = document.getElementById("end") as HTMLInputElement;

  areaSelect.value = "-1";
  startInput.value = "";
  endInput.value = "";

  updateHeatmap();
  updateAreaInfo();
});

async function updateAreaInfo() {
  const areaSelect = document.getElementById("area") as HTMLSelectElement;
  const areaCode = areaSelect.value;

  if (areaCode == "-1") {
    document.getElementById("area-info")!.innerHTML = "";
    return;
  }

  let url = `http://${window.location.hostname}/area-info?area_code=${areaCode}`;

  var res = await fetch(url)
  let areaInfo = await res.json()

  document.getElementById("area-info")!.innerHTML = `
    <small>
      <strong>Area Info</strong>
      <p>Area Code: ${areaCode}</p>
      <p>Average Age: ${areaInfo.averageAge}</p>
      <p>Most Used Weapon Code: ${areaInfo.mostUsedWeaponCode}</p>
      <p>Weapon Description: ${areaInfo.weaponDesc}</p>
      <p>Weapon Used Count: ${areaInfo.weaponUsedCount}</p>
      <p>Most Common Sex: ${areaInfo.mostCommonSex}</p>
      <p>Average Risk: ${areaInfo.averageRisk}</p>
    </small>
    `
}

//CREATE
document.getElementById("createLocModalOpenBtn")!.addEventListener("click", () => {
  const modal = document.getElementById("createLocModal")!;
  modal.classList.remove("invisible");
  modal.classList.remove("opacity-0");
});

document.getElementById("createLocModalCloseBtn")!.addEventListener("click", () => {
  const modal = document.getElementById("createLocModal")!;
  setTimeout(() => modal.classList.add("invisible"), 150);
  modal.classList.add("opacity-0");
});

document.getElementById("createLocBtn")!.addEventListener("click", async () => {
  const latInput = document.getElementById("lat") as HTMLInputElement;
  const longInput = document.getElementById("long") as HTMLInputElement;
  const areaCodeInput = document.getElementById("areaCode") as HTMLInputElement;

  const lat = parseFloat(latInput.value);
  const long = parseFloat(longInput.value);
  const areaCode = parseInt(areaCodeInput.value);

  const res = await fetch(`http://${window.location.hostname}/location`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ lat, long, areaCode })
  });
  const body = await res.json();

  if (res.status == 200 && !body.message) {
    alert("Location created successfully");
    document.getElementById("createLocModalCloseBtn")!.click();
    updateHeatmap();

    document.getElementById("area-info")!.innerHTML = "";
    document.getElementById("area-info")!.innerHTML = `
    <small>
      <strong>Area Info</strong>
      <p>Area Code: ${areaCode}</p>
      <p>Average Age: ${body.averageAge}</p>
      <p>Most Used Weapon Code: ${body.mostUsedWeaponCode}</p>
      <p>Weapon Description: ${body.weaponDesc}</p>
      <p>Weapon Used Count: ${body.weaponUsedCount}</p>
      <p>Most Common Sex: ${body.mostCommonSex}</p>
      <p>Average Risk: ${body.averageRisk}</p>
    </small>
    `

  } else {
    alert(`Error: ${body.message}`);
  }

});

//UPDATE
document.getElementById("updateLocModalOpenBtn")!.addEventListener("click", () => {
  const modal = document.getElementById("updateLocModal")!;
  modal.classList.remove("invisible");
  modal.classList.remove("opacity-0");
});

document.getElementById("updateLocModalCloseBtn")!.addEventListener("click", () => {
  const modal = document.getElementById("updateLocModal")!;
  setTimeout(() => modal.classList.add("invisible"), 150);
  modal.classList.add("opacity-0");
});

document.getElementById("updateLocBtn")!.addEventListener("click", async () => {

  const locationIdInput = document.getElementById("updateLocationId") as HTMLInputElement;
  const latInput = document.getElementById("updateLat") as HTMLInputElement;
  const longInput = document.getElementById("updateLong") as HTMLInputElement;
  const areaCodeInput = document.getElementById("updateAreaCode") as HTMLInputElement;

  const lat = parseFloat(latInput.value);
  const long = parseFloat(longInput.value);
  const areaCode = parseInt(areaCodeInput.value);
  const locationId = parseInt(locationIdInput.value);

  const res = await fetch(`http://${window.location.hostname}/location`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ lat, long, areaCode, locationId })
  });

  const body = await res.json();

  if (res.status == 200 && !body.message) {
    alert("Location updated successfully");
    document.getElementById("updateLocModalCloseBtn")!.click();
    updateHeatmap();
  } else {
    alert(`Error: ${body.message}`);
  }



});

//DELETE
document.getElementById("deleteLocModalOpenBtn")!.addEventListener("click", () => {
  const modal = document.getElementById("deleteLocModal")!;
  modal.classList.remove("invisible");
  modal.classList.remove("opacity-0");
});

document.getElementById("deleteLocModalCloseBtn")!.addEventListener("click", () => {
  const modal = document.getElementById("deleteLocModal")!;
  setTimeout(() => modal.classList.add("invisible"), 150);
  modal.classList.add("opacity-0");
});

document.getElementById("deleteLocBtn")!.addEventListener("click", async () => {
  const locationIdInput = document.getElementById("deleteLocationId") as HTMLInputElement;

  const locationId = parseInt(locationIdInput.value);

  const res = await fetch(`http://${window.location.hostname}/location?location_id=${locationId}`, {
    method: "DELETE",
  });

  const body = await res.json();

  if (res.status == 200 && !body.message) {
    alert("Location deleted successfully");
    document.getElementById("deleteLocModalCloseBtn")!.click();
    updateHeatmap();
  } else {
    alert(`Error: ${body.message}`);
  }

});

document.getElementById("otherPageLink")!.setAttribute("href", `http://${window.location.hostname}:3001`);
