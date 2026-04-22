let map = L.map('map').setView([53.430127, 14.564802], 18);
L.tileLayer.provider('Esri.WorldImagery').addTo(map);

let marker = L.marker([53.430127, 14.564802]).addTo(map);
marker.bindPopup("<strong>Hello!</strong><br>This is a popup.");

document.getElementById("saveButton").addEventListener("click", function() {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
  leafletImage(map, function (err, canvas) {
    let rasterMap = document.getElementById("rasterMap");
    let rasterContext = rasterMap.getContext("2d");
    rasterContext.drawImage(canvas, 0, 0);
    initializePuzzle(canvas);
  });
});

document.getElementById("getLocation").addEventListener("click", function(event) {
  if (! navigator.geolocation) {
    console.log("No geolocation.");
  }

  navigator.geolocation.getCurrentPosition(position => {
    console.log(position);
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    map.setView([lat, lon]);
    marker.setLatLng([lat, lon]);
    document.getElementById("latitude").innerText = lat;
    document.getElementById("longitude").innerText = lon;
  }, positionError => {
    console.error(positionError);
  });
});

let pieces =[];
let draggedPiece = null;
function initializePuzzle(sourceCanvas){
  pieces=[];
  arrangingPuzzles = [];
  let table = document.getElementById("table");
  table.innerHTML = "";
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let arrangedPuzzle = document.createElement("div");
      arrangedPuzzle.classList.add("arrangedPuzzle");
      arrangedPuzzle.dataset.id = `${row}-${col}`;

      arrangedPuzzle.addEventListener("dragover", function(event) {
        event.preventDefault();
      })

      arrangedPuzzle.addEventListener("drop", function(event) {
        event.preventDefault();
        let target = this;
        let source = draggedPiece.parentNode;
        let swappedPiece = target.firstChild;
        if(swappedPiece && swappedPiece !== draggedPiece) {
          source.appendChild(swappedPiece);
        }
        target.appendChild(draggedPiece);
        Solved();
      })

      arrangingPuzzles.push(arrangedPuzzle);
      table.appendChild(arrangedPuzzle);

      let puzzel = document.createElement("canvas");
      puzzel.width = 100;
      puzzel.height = 100;
      puzzel.draggable = true;
      puzzel.dataset.id = `${row}-${col}`;
      puzzel.classList.add("puzzle");
      puzzel.style.margin = "0";
      puzzel.style.padding = "0";
      puzzel.style.boxSizing = "border-box";
      puzzel.style.border = "1px dashed white";
      puzzel.style.display = "default";
      puzzel.addEventListener("dragstart", function(event) {
        draggedPiece = this;
      })
      puzzel.addEventListener("dragend", function(event) {
        draggedPiece = null;
      })
      let fragment = puzzel.getContext("2d");
      fragment.drawImage(sourceCanvas, col * 100, row * 100, 100, 100, 0, 0, 100, 100);
      pieces.push(puzzel);

    }
  }
  pieces.sort(function(a, b) {
    return Math.random() - 0.5;
  })
  pieces.forEach(function(piece, index) {
    arrangingPuzzles[index].appendChild(piece);
  })
}

function Solved(){
  let allFields = document.querySelectorAll(".arrangedPuzzle");
  let solved = true;
  allFields.forEach(function(field){
    let piece = field.firstChild;
    if (!piece || piece.dataset.id !== field.dataset.id) {
      solved = false;
    }
  });
  if (solved) {
    new Notification("Gratulacje!", {
      body: "Udało Ci się ułożyć puzzle!"
    });

  }
}
