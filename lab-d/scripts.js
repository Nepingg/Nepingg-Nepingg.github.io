//const KEY
class Favorites {
  constructor(){
  this.cities = [];
  this.load();
  this.list = document.getElementById("list");
  this.input = document.getElementById("cityInput");
  }
  draw(){
    const that = this;
    this.list.innerHTML = "";
    if(this.cities.length === 0){
      this.list.innerHTML = "<div class='empty'>Brak miast zapisanych w ulubionych</div>";
      return;
    }
    for(let i=0; i<this.cities.length; i++){
      const city  = this.cities[i];

      const favList = document.createElement("div");
      favList.className = "favList";

      const cityName = document.createElement("span");
      cityName.className = "favCity";
      cityName.textContent = city;

      cityName.onclick = function() {
        that.input.value = city;
        that.hideList();
      }

      const delButton = document.createElement("button");
      delButton.className = "delButton";
      delButton.textContent = "✖️";
      delButton.title = "Remove from favorites";

      delButton.onclick = function(e){
        e.stopPropagation();
        that.remove(i);
      }
      favList.appendChild(cityName);
      favList.appendChild(delButton);
      this.list.appendChild(favList);

    }
  }
  add(city){
    const trimmed = city.trim();
    if(trimmed.length<2) return;
    if(this.cities.length >=3) {
      alert("Możesz mieć maksymalnie 3 ulubione miasta");
      return;
    }
    if(!this.cities.includes(trimmed)){
      this.cities.push(trimmed);
      this.save();
      this.draw();
      this.showList();
    }
    else{
      alert("Miasto juz jest w ulubionych");
    }
  }
  remove(index){
    this.cities.splice(index, 1);
    this.save();
    this.draw();
  }
  save(){
    localStorage.setItem("favoriteCities", JSON.stringify(this.cities));
  }
  load(){
    const locStor = localStorage.getItem("favoriteCities");
    if(locStor){
      this.cities = JSON.parse(locStor);
    }
  }
  showList(){
    this.list.classList.add("show");
  }
  hideList(){
    this.list.classList.remove("show");
  }

}
const WeatherApp = class {
  constructor(apiKey,currentBlockSelector, forecastBlockSelector, forecastContentSelector){
    this.apiKey = apiKey;
    this.currentBlock = document.querySelector(currentBlockSelector);
    this.forecastBlock = document.querySelector(forecastBlockSelector);
    this.forecastContent = document.querySelector(forecastContentSelector);
    this.currentWeatherLink = `https://api.openweathermap.org/data/2.5/weather?q={query}&appid=${apiKey}&units=metric&lang=pl`;
    this.forecastLink = `https://api.openweathermap.org/data/2.5/forecast?q={query}&appid=${apiKey}&units=metric&lang=pl`;
    this.currentWeather = undefined;
    this.forecastDays = [];
    this.currentSlideIndex = 0;
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');

    this.initCarouselEvents();
  }
  initCarouselEvents() {
    const that = this;

    this.prevBtn.addEventListener('click', function() {
      that.currentSlideIndex--;
      if (that.currentSlideIndex < 0) {
        that.currentSlideIndex = that.forecastDays.length - 1;
      }
      that.renderSlide();
    });

    this.nextBtn.addEventListener('click', function() {
      that.currentSlideIndex++;
      if (that.currentSlideIndex >= that.forecastDays.length) {
        that.currentSlideIndex = 0;
      }
      that.renderSlide();
    });
  }
  getCurrentWeather(query){
    const that = this;
    let url = this.currentWeatherLink.replace("{query}", query);
    let req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.addEventListener("load", ()=>{
      this.currentWeather = JSON.parse(req.responseText);
      this.drawWeather();
  });
    req.addEventListener("error", function() {
      that.currentBlock.innerHTML = "Wystąpił błąd sieci.";
    });
    req.send();
  }

  getWeather(query){
    this.getCurrentWeather(query);
    this.getForecast(query);
  }
  drawWeather() {
    if (this.currentWeather) {
      const date = new Date(this.currentWeather.dt * 1000);
      const dateString = `${date.toLocaleDateString("pl-PL")} ${date.toLocaleTimeString("pl-PL")}`;
      const weatherBlock = this.createWeatherBlock(
        dateString,
        this.currentWeather.name,
        this.currentWeather.main.temp,
        this.currentWeather.main.feels_like,
        this.currentWeather.weather[0].icon,
        this.currentWeather.weather[0].description
      );
      this.currentBlock.innerHTML = "";
      this.currentBlock.appendChild(weatherBlock);
    }
  }
  createWeatherBlock(dateString, cityName, temp, percTemp, icon, des)
  {
    const description = des.toLowerCase();
    let bgClass = "bg";
    if (description.includes("bezchmurnie") || description.includes("czyste niebo")) {
      bgClass = "bg";
    }
    else if(description.includes("chmur")){
      bgClass = "cloudy";
    }
    else if(description.includes("deszcz")|| description.includes("słabe")){
      bgClass = "rainy";
    }
    else if(description.includes("burz")){
      bgClass = "stormy";
    }
    const weatherBlock = document.createElement("div");
    weatherBlock.className = `weatherBlock ${bgClass}`;

    const title = document.createElement("h2");
    title.textContent = `Bieżąca pogoda w: ${cityName}`;
    weatherBlock.appendChild(title);

    const dateP = document.createElement("p");
    const dateStrong = document.createElement("strong");
    dateStrong.textContent = "Czas: ";
    dateP.appendChild(dateStrong);
    dateP.appendChild(document.createTextNode(dateString));
    weatherBlock.appendChild(dateP);

    const iconImg = document.createElement("img");
    iconImg.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    iconImg.alt = des;
    iconImg.style.display = "block";
    iconImg.style.margin = "0";
    weatherBlock.appendChild(iconImg);

    const tempP = document.createElement("p");
    tempP.textContent = "Temperatura: ";

    const tempStrong = document.createElement("strong");
    tempStrong.textContent = `${temp} °C`;
    tempP.appendChild(tempStrong);

    tempP.appendChild(document.createTextNode(` (odczuwalna: ${percTemp} °C)`));
    weatherBlock.appendChild(tempP);

    const descP = document.createElement("p");
    descP.textContent = `Jest ${des}`;
    weatherBlock.appendChild(descP);



    return weatherBlock;

  }
  renderSlide() {
    if (this.forecastDays.length === 0) return;

    const day = this.forecastDays[this.currentSlideIndex];
    const dniTygodnia = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const dataZApi = new Date(day.dt_txt.replace(/-/g, '/'));
    const nazwaDnia = dniTygodnia[dataZApi.getDay()];

    const iconCode = day.weather[0].icon;
    const description = day.weather[0].description;

    let bgClass = "bg";
    if (description.includes("bezchmurnie") || description.includes("czyste niebo")) {
      bgClass = "bg";
    }
    else if(description.includes("chmur")){
      bgClass = "cloudy";
    }
    else if(description.includes("deszcz")|| description.includes("słabe")){
      bgClass = "rainy";
    }
    else if(description.includes("burz")){
      bgClass = "stormy";
    }


    this.forecastContent.textContent = "";

    const forecastBlock = document.createElement("div");
    forecastBlock.className = `forecast-block ${bgClass}`;

    const dayP = document.createElement("p");
    const dayStrong = document.createElement("strong");
    dayStrong.textContent = nazwaDnia;
    dayP.appendChild(dayStrong);
    forecastBlock.appendChild(dayP);

    const dateP = document.createElement("p");
    dateP.textContent = `Pogoda na dzień i godzinę ${day.dt_txt}`;
    forecastBlock.appendChild(dateP);

    const iconImg = document.createElement("img");
    iconImg.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconImg.alt = description;
    iconImg.style.display = "block";
    iconImg.style.margin = "0";
    forecastBlock.appendChild(iconImg);

    const tempP = document.createElement("p");
    tempP.textContent = "Temperatura tego dnia: ";
    const tempStrong = document.createElement("strong");
    tempStrong.textContent = `${day.main.temp} °C`;
    tempP.appendChild(tempStrong);
    forecastBlock.appendChild(tempP);

    const descP = document.createElement("p");
    if(description.includes("opady")){
      descP.textContent = `Będą ${description} `;
    }
    else{
      descP.textContent = `Będzie ${description} `;
    }

    forecastBlock.appendChild(descP);

    this.forecastContent.appendChild(forecastBlock);
  }
  getForecast(query) {
    const that = this;
    const url = this.forecastLink.replace("{query}", query);

    fetch(url)
      .then(function(response) {
        if (!response.ok) throw new Error('Błąd sieci');
        return response.json();
      })
      .then(function(data) {
        that.forecastDays = data.list.filter(function(item) {
          return item.dt_txt.includes("12:00:00");
        });

        that.currentSlideIndex = 0;
        that.forecastBlock.style.display = "block";
        that.renderSlide();
      })
      .catch(function(error) {
        that.forecastBlock.style.display = "block";
        that.forecastBlock.innerHTML = `<p style="color:red;">Błąd pobierania prognozy: ${error.message}</p>`;
      });
  }


}
const favApp = new Favorites();
favApp.draw();

const app = new WeatherApp(
  '7ded80d91f2b280ec979100cc8bbba94',
  '#currentWeather',
  '#forecastWeather',
  '#forecastContent'
);

const weatherBtn = document.getElementById('weatherBtn');
const addFavBtn = document.getElementById('addFavBtn');
const cityInput = document.getElementById('cityInput');
const favDropdown = document.getElementById('list');

addFavBtn.addEventListener('click', function(e) {
  e.preventDefault();
  const city = cityInput.value;
  favApp.add(city);
});
cityInput.addEventListener('focus', function() {
  if (favApp.cities.length > 0) {
    favApp.showList();
  }
});
document.addEventListener('click', function(event) {
  if (!cityInput.contains(event.target) && !favDropdown.contains(event.target) && event.target.id !== 'addFavBtn') {
    favApp.hideList();
  }
});

weatherBtn.addEventListener('click', function() {
  const query = cityInput.value.trim();
  if (query === "") {
    alert("Proszę wpisać nazwę miasta!");
    return;
  }
  favApp.hideList();
  app.getWeather(query);
});
