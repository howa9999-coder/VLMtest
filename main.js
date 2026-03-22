//ADD SUITABLE COMMENTS TO THE CODE

/* DOM */
const DOM = {
    baselayerSelect: document.querySelector('#baselayer-select'),
    panel: document.querySelector('#editPanel'),
    dataForm: document.querySelector('#data-form'),
    searchContainer: document.querySelector('#search-container'),
    searchInput: document.querySelector('#search-input'),
   // searchBtn: document.querySelector('.btn-search'),
    checkboxesContainer: document.querySelector('#checkboxes-container')
}
//FULL SCREEN to be fixed: i need for small screen a landscape rotation????
const main = document.querySelector('#map')
function toggleFullScreen() {
  if (document.fullscreenElement !== main) {
    main.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
/* Layers Data */
/* let vesselData = {
    decks: [
        {
            id: "baselayer",
            name: "baselayer1",
            src: "files/baselayers/baselayer1.svg",
            width: 794,
            height: 1123,
            overlays: [
                {
                    id: 1001,
                    name: 'casualty',
                    src:'files/overlays/marine casualty_layer.json'
                }
            ]
        },
        {
            id: "deck1",
            name: "SW cooling",
            src: "files/baselayers/sw_cooling.svg",
            width: 3287,
            height: 2240,
            overlays: [
                {
                    id: 101,
                    name: 'equipment01',
                    src:'files/overlays/equipment01_layer.json'
                },
                {
                    id: 102,
                    name: 'test',
                    src:'files/overlays/test_layer.json'
                }
            ]
        },
        {
            id: "deck2",
            name: "Fuel service",
            src: "files/baselayers/fuel_service.svg",
            width: 6698,
            height: 2237,
            overlays: [
                {
                    id: 201,
                    name: 'equipment03',
                    src:'files/overlays/equipment03_layer.json'
                },
                {
                    id: 202,
                    name: 'equipment07',
                    src:'files/overlays/equipment07_layer.json'
                }
            ]
        }
    ]
}; */

let vesselData = {
    decks: [
        {
            id: "deck1",
            name: "Deck1",
            src: "files/baselayers/deck1.svg",
            width: 2247,
            height: 697,
            overlays: [
                {
                    id: 1001,
                    name: 'Fire extinguishers',
                    src:'files/overlays/Fire extinguisher_layer.json'
                },
                {
                    id: 1002,
                    name: 'Lifejackets',
                    src:'files/overlays/LifeJacket_layer.json'
                }
            ]
        },
        {
            id: "deck2",
            name: "Deck2",
            src: "files/baselayers/deck2.svg",
            width: 2247,
            height: 697,
            overlays: [
                {
                    id: 1003,
                    name: 'Fire extinguishers',
                    src:'files/overlays/Fire extinguishers2_layer.json'
                },
                {
                    id: 1004,
                    name: 'Lifejackets',
                    src:'files/overlays/LifeJacket2_layer.json'
                }
            ]
        },
            ]
        }


/**************************************************** 
*  MAP INITIALIZATION 
****************************************************/ 
const map = L.map('map', {
    zoomControl:false,
    crs: L.CRS.Simple,
    minZoom: -3
});

let overlayGroup = L.layerGroup();

/* State */
let state = {
    baselayer: null,
    glowIcon: null,
    markerIndex: {},
    selectedLayer: null,
    activeDeckIdx: 0,
    selectedOverlayIdx: 0,
    overlays: {}
}
init()
addBaselayer()
function init() {
    vesselData.decks.forEach((deck, idx) => {
        let opt = document.createElement('option');
        opt.value = idx;
        opt.innerText = deck.name;
        DOM.baselayerSelect.appendChild(opt);
    });
    addBaselayer()
    overlayNameCheckBox()
}


function overlayNameCheckBox(){  
    //CLEAR CHECKBOXES CONTAINER HTML
    DOM.checkboxesContainer.innerHTML='<div class="check-cat">Fire and Safety Equipment Layout</div>'; 
    //CLEAR OVERLAYGROUP
    overlayGroup.clearLayers();
    vesselData.decks[state.activeDeckIdx].overlays.forEach((overlay, idx) => {
        let checkBox = document.createElement('input');
        let label = document.createElement('label');
        label.classList = 'check-label'
        checkBox.id = overlay.name
        checkBox.classList = 'checkbox-overlay'
        checkBox.type = 'checkbox'
        checkBox.setAttribute('dataKey', idx)
        label.appendChild(checkBox)
        label.innerHTML += overlay.name
        DOM.checkboxesContainer.appendChild(label);
    });
    document.querySelectorAll('.checkbox-overlay').forEach(box=>{
    box.addEventListener('change', ()=>{
        conditionsLayer(box)
    })
})
}

DOM.baselayerSelect.addEventListener('change',(e)=>{
    state.activeDeckIdx = e.target.value

    DOM.panel.classList.remove('active')
    DOM.searchContainer.classList.remove('active')

    // remove all overlays
    overlayGroup.clearLayers()

    // reset stored references
    Object.keys(state.overlays).forEach(k => delete state.overlays[k])

    addBaselayer()
    overlayNameCheckBox()
})

//================FUNCTION TO ADD BASELAYER to THE MAP

function addBaselayer(){
    map.eachLayer(layer => {
        // Only remove layers that are not the base image and are editable (Geoman layers)
            map.removeLayer(layer);
    });
    const baselayerObject = vesselData.decks[state.activeDeckIdx]
    const mapWidth = baselayerObject.width, mapHeight = baselayerObject.height;
    const bounds = [[0,0],[mapHeight,mapWidth]];
    state.baselayer = L.imageOverlay(baselayerObject.src, bounds).addTo(map);   
    state.selectedLayer = null
    map.fitBounds(bounds);
    
}
//Function to remove overlay if it is checked and remove it if it is unchecked
function conditionsLayer(box){

    let key = box.getAttribute('dataKey');
    DOM.searchContainer.classList.add('active')

    if (box.checked) {
        state.selectedOverlayIdx = key;
        addOverlay();
        overlayGroup.addTo(map)
    } else {
        if (state.overlays[key]) {
            overlayGroup.removeLayer(state.overlays[key])
            delete state.overlays[key];
            overlayGroup.addTo(map)
        }
    }
}
//=====ADD GEOJSON LAYER (overlay) to MAP
function addOverlay(){
    //CUSTOMICON OR CUSTOMSTYLE
   let file = vesselData.decks[state.activeDeckIdx].overlays[state.selectedOverlayIdx].src
    fetch(file)
    .then(response => response.json())
    .then(data => {
     // console.log(data)
        if(data.overlayType !== 'point'){
            customStyle = {
                            fillColor: data.color, 
                            weight: data.weight,         
                            opacity: data.opacity,       
                            color: data.color ,    
                            fillOpacity: data.opacity
            }
        }else{
            state.glowIcon = L.divIcon({
                html:`<div class="glow-marker"><img src="${data.iconPath}" style="width: 32px; height: 32px" alt=""></div>`,
                iconSize:[32,32],
                className: '' 
            });
        }
        state.markerIndex={}   
        //add geojson to overlayGroup     
        let geojsonLayer = L.geoJSON(data,{
                    style: function() {return customStyle},
                     pointToLayer: function(feature, latlng){
                        return L.marker(latlng, {icon: state.glowIcon});
                    },
                    onEachFeature: function (feature, layer) {
                        state.markerIndex[feature.properties.labelID] = layer;
                        layer.on('click', ()=>{
                            // remove highlight from previous marker
                            if(data.overlayType === 'point'){
                                if (state.selectedLayer) {
                                    state.selectedLayer.getElement().classList.remove('selected-marker')
                                }
                                // add highlight to clicked marker
                                layer.getElement().classList.add('selected-marker')
                                state.selectedLayer = layer
                            }
                        })
                        let properties = feature.properties;
                        layer.addEventListener('click', ()=>{
                            DOM.panel.classList.add('active')
                            DOM.dataForm.innerHTML=`<h4 id="edit-title" style="color: var(--gold); margin-bottom: 10px;">EQUIPMENT DATA</h4>`
                            Object.entries(properties).forEach(property=>{
                            const key = property[0]
                            const value = property[1]
                            const id = properties.id

                            if(key!='id'){
                                const div = document.createElement('div')
                                const label = document.createElement('label')
                                const input = document.createElement('input')
                                input.readOnly = true;
                                label.innerHTML = key
                                input.id= `${key}-${id}`
                                input.value = value
                                div.appendChild(label)
                                div.appendChild(input)
                                DOM.dataForm.appendChild(div)
                             }
                            })
                        })
                            
                    }
        }).addTo(overlayGroup); // addTo(map)
       // map.fitBounds(geojsonLayer.getBounds());
        state.overlays[state.selectedOverlayIdx] = geojsonLayer;
    //    return geojsonLayer
    })
    .catch(error => console.error('Error loading JSON:', error));
}


/* Search feature */
//I NEED TO CLEAN THE MARKERIDX ONLY IF THE BASELAYER IS CHANGED NOT WHENEVER CLICK TO DISPLAY AN OVERLAY
DOM.searchInput.addEventListener('keypress', () => {
    const value = DOM.searchInput.value.trim();
    console.log(state.markerIndex)
    if (!value) {
        alert('Enter equipment ID');
        return;
    }

    const marker = state.markerIndex[value];

    if (!marker) {
        alert('The equipment does not exist on this layer');
        return;
    }

    map.flyTo(marker.getLatLng(), 2);

    // optional: open popup if exists
    if (marker.getPopup()) {
        marker.openPopup();
    }
});